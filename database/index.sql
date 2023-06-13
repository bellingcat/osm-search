CREATE INDEX planet_osm_line_tags_idx ON public.planet_osm_line USING gin (tags);
CREATE INDEX planet_osm_line_way_idx ON public.planet_osm_line USING gist (way) WITH (fillfactor='100');
CREATE INDEX planet_osm_point_tags_idx ON public.planet_osm_point USING gin (tags);
CREATE INDEX planet_osm_point_way_idx ON public.planet_osm_point USING gist (way) WITH (fillfactor='100');
CREATE INDEX planet_osm_polygon_tags_idx ON public.planet_osm_polygon USING gin (tags);
CREATE INDEX planet_osm_polygon_way_idx ON public.planet_osm_polygon USING gist (way) WITH (fillfactor='100');

