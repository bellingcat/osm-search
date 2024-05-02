import math
import time
from datetime import datetime, timedelta
from functools import wraps
from typing import Literal

import firebase_admin
import psycopg
from api_types import Bbox, Filter, PostgresConfig, RequestParams, Timeout
from firebase_admin import auth, credentials, firestore
from flask import Flask, Request, Response, jsonify, request
from flask_cors import CORS
from loguru import logger
from psycopg import sql
from psycopg.rows import dict_row
from pydantic import ValidationError

cred = credentials.Certificate("service_account.json")
firebase_app = firebase_admin.initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

CORS(app)

ALLOWED_COMPARISONS = [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "starts with",
    "ends with",
    "contains",
    "does not contain",
    "is null",
    "is not null",
]

ALLOWED_METHODS = ["OR", "AND"]

ALLOWED_CASTS = ["integer", "float", "cast_to_int", "cast_to_float"]


def get_db_connection() -> psycopg.Connection:
    db_config = PostgresConfig()
    conn = psycopg.connect(
        database=db_config.database,
        host=db_config.host,
        port=db_config.port,
        user=db_config.user,
        password=db_config.password,
    )
    return conn


def query_with_timing(
    query, conn: psycopg.Connection | None = None
) -> tuple[list[dict], timedelta]:
    if conn is None:
        conn = get_db_connection()

    cur: psycopg.Cursor = conn.cursor(row_factory=dict_row)

    cur.execute("SET SESSION statement_timeout = '100s';")

    t1: datetime = datetime.now()
    try:
        cur.execute(query)
    except psycopg.errors.QueryCanceled:
        logger.warning("Request timed out")
        raise Timeout()

    data: list[dict] = cur.fetchall()
    cur.close()
    conn.close()

    t2 = datetime.now()

    for d in data:
        d.pop("point_geom")

    return (data, t2 - t1)


def get_user(request: Request):
    token = None

    if "Authorization" in request.headers:
        token = request.headers["Authorization"].split(" ")[1]

    if not token:
        return None

    idinfo = auth.verify_id_token(token)
    return idinfo


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            token = request.headers["Authorization"].split(" ")[1]
        if not token:
            logger.info("Request with missing authentication token.")
            return {
                "message": "Authentication Token is missing!",
                "data": None,
                "error": "Unauthorized",
            }, 401
        try:
            idinfo = auth.verify_id_token(token)

            if idinfo is None:
                logger.warning(f"Invalid authentication token {token}")
                return {
                    "message": "Invalid Authentication token!",
                    "data": None,
                    "error": "Unauthorized",
                }, 403
        except Exception as e:
            logger.warning(f"Other error {e}")
            return {
                "message": "Something went wrong",
                "data": None,
                "error": str(e),
            }, 403

        logger.info(f"Authenticated request by {idinfo['email']}")
        return f(*args, **kwargs)

    return decorated


def make_filter_query(filter: Filter):
    filter_query = sql.SQL("")

    i = 0

    for subfilter in filter.filters:
        if subfilter.comparison not in ALLOWED_COMPARISONS:
            logger.error(f"Invalid comparison {subfilter.comparison}")
            break

        if subfilter.comparison == "=":
            filter_query = sql.SQL("{filter_query} (tags @> {match})").format(
                filter_query=filter_query,
                match=sql.Literal(subfilter.parameter + "=>" + subfilter.value),
            )
        elif subfilter.comparison == "!=":
            filter_query = sql.SQL("{filter_query} NOT(tags @> {match})").format(
                filter_query=filter_query,
                match=sql.Literal(subfilter.parameter + "=>" + subfilter.value),
            )
        elif subfilter.comparison == "is null":
            filter_query = sql.SQL("{filter_query} NOT(tags?{parameter})").format(
                filter_query=filter_query, parameter=sql.Literal(subfilter.parameter)
            )
        elif subfilter.comparison == "is not null":
            filter_query = sql.SQL("{filter_query} (tags?{parameter})").format(
                filter_query=filter_query, parameter=sql.Literal(subfilter.parameter)
            )
        else:
            parameter = sql.SQL("tags->{parameter}").format(
                parameter=sql.Literal(subfilter.parameter)
            )

            if "cast" in subfilter and subfilter.cast in ALLOWED_CASTS:
                if subfilter.cast == "cast_to_float":
                    parameter = sql.SQL("cast_to_float({parameter}, 0.0)").format(
                        parameter=parameter
                    )
                elif subfilter.cast == "cast_to_int":
                    parameter = sql.SQL("cast_to_int({parameter}, 0)").format(
                        parameter=parameter
                    )
                else:
                    parameter = sql.SQL("CAST({parameter} AS {cast})").format(
                        parameter=parameter, cast=sql.SQL(subfilter.cast)
                    )

            if subfilter.comparison == "starts with":
                subfilter.value = f"{subfilter.value}%"
                subfilter.comparison = "ILIKE"
            elif subfilter.comparison == "ends with":
                subfilter.value = f"%{subfilter.value}"
                subfilter.comparison = "ILIKE"
            elif subfilter.comparison == "contains":
                subfilter.value = f"%{subfilter.value}%"
                subfilter.comparison = "ILIKE"
            elif subfilter.comparison == "does not contain":
                subfilter.value = f"%{subfilter.value}%"
                subfilter.comparison = "NOT ILIKE"

            filter_query = sql.SQL(
                "{filter_query} ({parameter} {comparison} {value})"
            ).format(
                filter_query=filter_query,
                parameter=parameter,
                comparison=sql.SQL(subfilter.comparison),
                value=sql.Literal(subfilter.value),
            )

        if i != len(filter["filters"]) - 1:
            filter_query = sql.SQL("{filter_query} {method}").format(
                filter_query=filter_query, method=sql.SQL(filter["method"])
            )

        i += 1

    return filter_query


@app.route("/intersection")
@token_required
def get_intersection() -> tuple[Response, Literal[400]] | Response:
    try:
        params = RequestParams(
            buffer=request.args.get("buffer"),
            filters=request.args.get("filters"),
            l=request.args.get("l"),
            b=request.args.get("b"),
            r=request.args.get("r"),
            t=request.args.get("t"),
        )
    except ValidationError as e:
        # Handle errors in a way that fits your API design
        return jsonify({"error": "Invalid data", "details": e.errors()}), 400

    buffer: int = params.buffer
    filters: list[Filter] = params.filters

    bbox: Bbox = Bbox(params.l, params.b, params.r, params.t)

    area: float = (
        math.pow(6371, 2)
        * math.pi
        * abs(math.sin(math.radians(bbox.t)) - math.sin(math.radians(bbox.b)))
        * abs(bbox.r - bbox.l)
        / 180
    )

    # reject queries that are too large
    if area > 4e6:
        return Response(status=400)

    bbox_filter: sql.Composed = sql.SQL(
        "AND (way && ST_Transform(ST_MakeEnvelope({left}, {bottom}, {right}, {top}, 4326), 3857))"
    ).format(
        left=sql.Literal(bbox.l),
        bottom=sql.Literal(bbox.b),
        right=sql.Literal(bbox.r),
        top=sql.Literal(bbox.t),
    )

    first: Filter = filters[0]

    first_query: sql.Composed = sql.SQL(
        "SELECT tags->'name' AS name, ST_Centroid(way) AS point_geom, way AS geom FROM {table}"
    ).format(
        table=(
            sql.SQL("planet_osm_line")
            if first["type"] == "line"
            else (
                sql.SQL("planet_osm_polygon")
                if first["type"] == "polygon"
                else (
                    sql.SQL("planet_osm_point")
                    if first["type"] == "point"
                    else sql.SQL("planet_osm")
                )
            )
        )
    )
    first_filter: sql.Composed | sql.Sql = make_filter_query(first)
    first_assembled: sql.Composed = sql.SQL("{query} WHERE ({filter}) {bbox}").format(
        query=first_query, filter=first_filter, bbox=bbox_filter
    )

    logger.info(f"Buffer: {buffer}\tFilters: {filters}\tBbox: {str(bbox)}")

    subqueries: list[sql.Composed] = []
    for f in filters[1:]:
        filter = make_filter_query(f)

        if f.type == "point":
            source_query = sql.SQL("SELECT way AS geom FROM planet_osm_point")
        elif f.type == "line":
            source_query = sql.SQL("SELECT way AS geom FROM planet_osm_line")
        elif f.type == "polygon":
            source_query = sql.SQL("SELECT way AS geom FROM planet_osm_polygon")
        elif f.type == "any":
            source_query = sql.SQL("SELECT way AS geom FROM planet_osm")

        assembled: sql.Composed = sql.SQL("{query} WHERE ({filter}) {bbox}").format(
            query=source_query, filter=filter, bbox=bbox_filter
        )
        subqueries.append(assembled)

    join_query: sql.Composed = sql.SQL(
        "SELECT DISTINCT point_geom, name, ST_Y(ST_Transform(point_geom, 4326)) AS lat, ST_X(ST_Transform(point_geom, 4326)) as lng FROM ({point}) point "
    ).format(point=first_assembled)

    i = 0
    for q in subqueries:
        join_query = sql.SQL(
            "{join_query} JOIN ({q}) {subindex} ON ST_DWithin(point.geom, {subindex}.geom, {buffer})"
        ).format(
            join_query=join_query,
            q=q,
            subindex=sql.SQL("subquery" + str(i)),
            buffer=sql.Literal(buffer),
        )
        i += 1

    join_query = sql.SQL("{join_query} LIMIT 100").format(join_query=join_query)

    conn: psycopg.Connection = get_db_connection()

    logger.info(f"Executing query: {join_query.as_string(conn)}")

    timestamp: int = time.time_ns()
    user = get_user(request)

    try:
        data, tdiff = query_with_timing(join_query)
    except Timeout:
        return Response(status=408)

    log_data = {
        "timestamp": firestore.SERVER_TIMESTAMP,
        "query": join_query.as_string(conn),
        "user_uid": user["uid"],
        "user_email": user["email"],
        "bbox": list(bbox),
        "filters": filters,
        "query_time": tdiff.total_seconds(),
        "query_nresults": len(data),
        "query_results": data,
    }

    db.collection("searches").document(str(timestamp)).set(log_data)

    logger.info(f"Found {len(data)} results in {tdiff} seconds")

    return jsonify(data)


@app.route("/robots.txt")
def robots() -> Response:
    return Response("User-agent: *\nDisallow: /", mimetype="text/plain")


def start():
    app.run(port=5050)


if __name__ == "__main__":
    start()
