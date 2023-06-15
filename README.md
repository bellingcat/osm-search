# osm-search

This is a tool for allowing user friendly proximity queries from OpenStreetMap data.

Bellingcat has a hosted version of the tool at https://osm-search.bellingcat.com/. For more information, see [the accompanying article](https://www.bellingcat.com/resources/how-tos/2023/05/08/finding-geolocation-leads-with-bellingcats-openstreetmap-search-tool/).

![A screenshot of the tool in use](https://www.bellingcat.com/app/uploads/2023/04/image5-3-1200x829.png)

## Setup and hosting your own

### Setting up the database

A Postgres database must be set up with OSM data. This can be done with `osm2pgsql`. 

`osm2pgsql -d osm --hstore-all planet-latest.osm.pbf`

Next, some additional setup should be done on the database for performance and to create a combined view of all the data:

```
psql -d osm clean.sql
psql -d osm cluster.sql
psql -d osm index.sql
psql -d osm analyze.sql
psql -d osm views.sql
```

Note that if you run this using the entire planet OSM file, it will require about 700GB of space.

### Running the API

The API requires environment variables for connection with Postgres.

- `PG_DB`
- `PG_HOST`
- `PG_PORT`
- `PG_USER`
- `PG_PASSWORD`

### Running the frontend

The frontend requires one environment variable, `VUE_ENV_MAPBOX_KEY` to be set. This Mapbox key is used for geocoding queries.
