from psycopg2 import sql
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify, abort, Response
from flask_cors import CORS
import json
from google.oauth2 import id_token
import google.auth.transport
from functools import wraps
import os
from loguru import logger
from datetime import datetime

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

CORS(app)

def get_db_connection():
    conn = psycopg2.connect(database='osm')
    return conn

def json_query(query, conn=None):
    if conn is None:
        conn = get_db_connection()    

    cur = conn.cursor(cursor_factory=RealDictCursor)

    t1 = datetime.now()
    cur.execute(query)
    data = cur.fetchall()
    cur.close()
    conn.close()

    t2 = datetime.now()

    logger.info(f"Found {len(data)} results in {t2 - t1} seconds")
    return jsonify(data)

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
                "error": "Unauthorized"
            }, 401
        try:
            idinfo = id_token.verify_oauth2_token(token, google.auth.transport.requests.Request(), GOOGLE_CLIENT_ID)
            
            if idinfo is None:
                logger.warning(f"Invalid authentication token {token}")
                return {
                "message": "Invalid Authentication token!",
                "data": None,
                "error": "Unauthorized"
            }, 401

            if 'hd' not in idinfo or idinfo['hd'] != 'bellingcat.com':
                logger.warning(f"Unauthorized users {idinfo}")
                return {
                "message": "Unauthorized user",
                "data": None,
                "error": "Unauthorized"
            }, 403
        except Exception as e:
            logger.warning(f"Other error {e}")
            return {
                "message": "Something went wrong",
                "data": None,
                "error": str(e)
            }, 500

        logger.info(f"Authenticated request by {idinfo['email']}")
        return f(*args, **kwargs)

    return decorated

@app.route('/intersection')
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
    
    bbox_filter = sql.SQL("AND way && ST_Transform(ST_MakeEnvelope({left}, {bottom}, {right}, {top}, 4326), 3857)").format(left=sql.Literal(bbox[0]), bottom=sql.Literal(bbox[1]), right=sql.Literal(bbox[2]), top=sql.Literal(bbox[3]))

    first = filters[0]

    first_query = sql.SQL("SELECT name, ST_Centroid(way) AS point_geom, way AS geom FROM {table}").format(table=sql.SQL('planet_osm_line') if first['type'] == 'line' else sql.SQL('planet_osm_polygon') if first['type'] == 'polygon' else sql.SQL('planet_osm_point'))
    first_filter = sql.SQL("WHERE ({filter})").format(filter=sql.SQL(first['filter']))
    first_assembled = sql.SQL("{query} {filter} {bbox}").format(query=first_query, filter=first_filter, bbox=bbox_filter)

    logger.info(f"Buffer: {buffer}\tFilters: {filters}\tBbox: [{l},{b},{r},{t}]")

    subqueries = []
    for f in filters[1:]:
        filter = sql.SQL("WHERE ({filter})").format(filter=sql.SQL(f['filter']))

        if f['type'] == 'point':
            query = sql.SQL("SELECT way AS geom FROM planet_osm_point")
        elif f['type'] == 'line':
            query = sql.SQL("SELECT way AS geom FROM planet_osm_line")
        elif f['type'] == 'polygon':
            query = sql.SQL("SELECT way AS geom FROM planet_osm_polygon")

        assembled = sql.SQL("{query} {filter} {bbox}").format(query=query, filter=filter, bbox=bbox_filter)
        subqueries.append(assembled)

    join_query  = sql.SQL("SELECT DISTINCT point_geom, name, ST_Y(ST_Transform(point_geom, 4326)) AS lat, ST_X(ST_Transform(point_geom, 4326)) as lng FROM ({point}) point ").format(point=first_assembled)
        
    i = 0
    for q in subqueries:
        join_query = sql.SQL("{join_query} JOIN ({q}) {subindex} ON ST_DWithin(point.geom, {subindex}.geom, {buffer})").format(join_query=join_query, q=q, subindex=sql.SQL('subquery' + str(i)), buffer=sql.Literal(buffer))
        i += 1
        
    join_query = sql.SQL("{join_query} LIMIT 100").format(join_query=join_query)

    conn = get_db_connection()

    logger.info(f"Executing query: {join_query.as_string(conn)}")

    return json_query(join_query)
        

@app.route('/robots.txt')
def robots():
    return Response("User-agent: *\nDisallow: /", mimetype='text/plain')

def start():
    app.run(port=5050)

if __name__ == '__main__':
    start()
