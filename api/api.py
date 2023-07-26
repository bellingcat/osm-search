from psycopg2 import sql
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify, abort, Response
from flask_cors import CORS
import json
from functools import wraps
import os
from loguru import logger
from datetime import datetime
import math
import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth
from firebase_admin import firestore
import time

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


def get_db_connection():
    conn = psycopg2.connect(
        database=os.environ.get("PG_DB"),
        host=os.environ.get("PG_HOST"),
        port=os.environ.get("PG_PORT"),
        user=os.environ.get("PG_USER"),
        password=os.environ.get("PG_PASSWORD"),
    )
    return conn


def query_with_timing(query, conn=None):
    if conn is None:
        conn = get_db_connection()

    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SET SESSION statement_timeout = '100s';")

    t1 = datetime.now()
    try:
        cur.execute(query)
    except psycopg2.errors.QueryCanceled:
        logger.warning("Request timed out")
        return Response(status=400)

    data = cur.fetchall()
    cur.close()
    conn.close()

    t2 = datetime.now()

    for d in data:
        d.pop('point_geom')

    return (data, t2 - t1)

def get_user(request):
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


def make_filter_query(filter):
    filter_query = sql.SQL("")

    i = 0

    for subfilter in filter["filters"]:
        if subfilter["comparison"] not in ALLOWED_COMPARISONS:
            logger.error(f"Invalid comparison {subfilter['comparison']}")
            break

        if subfilter["comparison"] == "=":
            filter_query = sql.SQL("{filter_query} (tags @> {match})").format(
                filter_query=filter_query,
                match=sql.Literal(subfilter["parameter"] + "=>" + subfilter["value"]),
            )
        elif subfilter["comparison"] == "!=":
            filter_query = sql.SQL("{filter_query} NOT(tags @> {match})").format(
                filter_query=filter_query,
                match=sql.Literal(subfilter["parameter"] + "=>" + subfilter["value"]),
            )
        elif subfilter["comparison"] == "is null":
            filter_query = sql.SQL("{filter_query} NOT(tags?{parameter})").format(
                filter_query=filter_query, parameter=sql.Literal(subfilter["parameter"])
            )
        elif subfilter["comparison"] == "is not null":
            filter_query = sql.SQL("{filter_query} (tags?{parameter})").format(
                filter_query=filter_query, parameter=sql.Literal(subfilter["parameter"])
            )
        else:
            parameter = sql.SQL("tags->{parameter}").format(
                parameter=sql.Literal(subfilter["parameter"])
            )

            if "cast" in subfilter and subfilter["cast"] in ALLOWED_CASTS:
                if subfilter["cast"] == "cast_to_float":
                    parameter = sql.SQL("cast_to_float({parameter}, 0.0)").format(
                        parameter=parameter
                    )
                elif subfilter["cast"] == "cast_to_int":
                    parameter = sql.SQL("cast_to_int({parameter}, 0)").format(
                        parameter=parameter
                    )
                else:
                    parameter = sql.SQL("CAST({parameter} AS {cast})").format(
                        parameter=parameter, cast=sql.SQL(subfilter["cast"])
                    )

            if subfilter["comparison"] == "starts with":
                subfilter["value"] = f"{subfilter['value']}%"
                subfilter["comparison"] = "ILIKE"
            elif subfilter["comparison"] == "ends with":
                subfilter["value"] = f"%{subfilter['value']}"
                subfilter["comparison"] = "ILIKE"
            elif subfilter["comparison"] == "contains":
                subfilter["value"] = f"%{subfilter['value']}%"
                subfilter["comparison"] = "ILIKE"
            elif subfilter["comparison"] == "does not contain":
                subfilter["value"] = f"%{subfilter['value']}%"
                subfilter["comparison"] = "NOT ILIKE"

            filter_query = sql.SQL(
                "{filter_query} ({parameter} {comparison} {value})"
            ).format(
                filter_query=filter_query,
                parameter=parameter,
                comparison=sql.SQL(subfilter["comparison"]),
                value=sql.Literal(subfilter["value"]),
            )

        if i != len(filter["filters"]) - 1:
            filter_query = sql.SQL("{filter_query} {method}").format(
                filter_query=filter_query, method=sql.SQL(filter["method"])
            )

        i += 1

    return filter_query


@app.route("/intersection")
@token_required
def get_intersection():
    args = request.args

    buffer = int(args.get("buffer"))
    filters = json.loads(args.get("filters"))

    l = float(args.get("l"))
    b = float(args.get("b"))
    r = float(args.get("r"))
    t = float(args.get("t"))

    bbox = [l, b, r, t]

    area = (
        math.pow(6371, 2)
        * math.pi
        * abs(math.sin(math.radians(t)) - math.sin(math.radians(b)))
        * abs(r - l)
        / 180
    )

    # reject queries that are too large
    if area > 4e6:
        return Response(status=400)

    bbox_filter = sql.SQL(
        "AND (way && ST_Transform(ST_MakeEnvelope({left}, {bottom}, {right}, {top}, 4326), 3857))"
    ).format(
        left=sql.Literal(bbox[0]),
        bottom=sql.Literal(bbox[1]),
        right=sql.Literal(bbox[2]),
        top=sql.Literal(bbox[3]),
    )

    first = filters[0]

    first_query = sql.SQL(
        "SELECT tags->'name' AS name, ST_Centroid(way) AS point_geom, way AS geom FROM {table}"
    ).format(
        table=sql.SQL("planet_osm_line")
        if first["type"] == "line"
        else sql.SQL("planet_osm_polygon")
        if first["type"] == "polygon"
        else sql.SQL("planet_osm_point")
        if first["type"] == "point"
        else sql.SQL("planet_osm")
    )
    first_filter = make_filter_query(first)
    first_assembled = sql.SQL("{query} WHERE ({filter}) {bbox}").format(
        query=first_query, filter=first_filter, bbox=bbox_filter
    )

    logger.info(f"Buffer: {buffer}\tFilters: {filters}\tBbox: [{l},{b},{r},{t}]")

    subqueries = []
    for f in filters[1:]:
        filter = make_filter_query(f)

        if f["type"] == "point":
            query = sql.SQL("SELECT way AS geom FROM planet_osm_point")
        elif f["type"] == "line":
            query = sql.SQL("SELECT way AS geom FROM planet_osm_line")
        elif f["type"] == "polygon":
            query = sql.SQL("SELECT way AS geom FROM planet_osm_polygon")
        elif f["type"] == "any":
            query = sql.SQL("SELECT way AS geom FROM planet_osm")

        assembled = sql.SQL("{query} WHERE ({filter}) {bbox}").format(
            query=query, filter=filter, bbox=bbox_filter
        )
        subqueries.append(assembled)

    join_query = sql.SQL(
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

    conn = get_db_connection()

    logger.info(f"Executing query: {join_query.as_string(conn)}")

    timestamp = time.time_ns()
    user = get_user(request)

    data, tdiff = query_with_timing(join_query)

    log_data = {
        "timestamp": firestore.SERVER_TIMESTAMP,
        "query": join_query.as_string(conn),
        "user_uid": user["uid"],
        "user_email": user["email"],
        "bbox": bbox,
        "filters": filters,
        "query_time": tdiff.total_seconds(),
        "query_nresults": len(data),
        "query_results": data,
    }

    db.collection("searches").document(str(timestamp)).set(log_data)

    logger.info(f"Found {len(data)} results in {tdiff} seconds")

    return jsonify(data)


@app.route("/robots.txt")
def robots():
    return Response("User-agent: *\nDisallow: /", mimetype="text/plain")


def start():
    app.run(port=5050)


if __name__ == "__main__":
    start()
