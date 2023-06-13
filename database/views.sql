CREATE VIEW planet_osm AS
SELECT "osm_id", "tags", "way" FROM planet_osm_point
UNION ALL
SELECT "osm_id", "tags", "way" FROM planet_osm_line
UNION ALL
SELECT "osm_id", "tags", "way" FROM planet_osm_polygon;