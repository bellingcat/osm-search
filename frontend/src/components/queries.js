export default [
  {
    name: "Power pylon",
    type: "point",
    filter: "power = 'tower' OR power = 'pole'",
  },
  {
    name: "Public transport stop",
    type: "point",
    filter: "(public_transport IS NOT null OR highway='bus_stop')",
  },
  {
    name: "Church",
    type: "point",
    filter: "amenity = 'place_of_worship'",
  },
  {
    name: "Hospital",
    type: "point",
    filter: "amenity = 'hospital'",
  },
  {
    name: "Military",
    type: "point",
    filter: "military IS NOT null OR landuse = 'military'",
  },
  {
    name: "Restaurant",
    type: "point",
    filter:
      "amenity = 'restaurant' OR amenity = 'cafe' OR amenity = 'pub' OR amenity = 'fast_food'",
  },
  {
    name: "Waterway",
    type: "line",
    filter: "waterway IS NOT null",
  },
  {
    name: "Road",
    type: "line",
    filter: "highway IS NOT null",
  },
  {
    name: "Railroad",
    type: "line",
    filter: "railway IS NOT null",
  },
  {
    name: "Bridge",
    type: "line",
    filter: "bridge IS NOT null",
  },
  {
    name: "Road (motorway)",
    type: "line",
    filter: "highway = 'motorway' OR highway = 'motorway_link'",
  },
  {
    name: "Road (primary)",
    type: "line",
    filter: "highway = 'primary' OR highway = 'primary_link'",
  },
  {
    name: "Road (secondary)",
    type: "line",
    filter: "highway = 'secondary' OR highway = 'secondary_link",
  },
  {
    name: "Road (residential)",
    type: "line",
    filter: "highway = 'residential'",
  },
  {
    name: "Unpaved road",
    type: "line",
    filter: "surface = 'unpaved'",
  },
  {
    name: "1-lane road",
    type: "line",
    filter: "tags->'lanes' = '1'",
  },
  {
    name: "2-lane road",
    type: "line",
    filter: "tags->'lanes' = '2'",
  },
  {
    name: "3-lane road",
    type: "line",
    filter: "tags->'lanes' = '3'",
  },
  {
    name: "4-lane road",
    type: "line",
    filter: "tags->'lanes' = '4'",
  },
  {
    name: "5-lane road",
    type: "line",
    filter: "tags->'lanes' = '5'",
  },
  {
    name: "6-lane road",
    type: "line",
    filter: "tags->'lanes' = '6'",
  },
  {
    name: "Cliff",
    type: "line",
    filter: "planet_osm_line.natural = 'cliff'",
  },
  {
    name: "Park",
    type: "polygon",
    filter: "leisure = 'park'",
  },
  {
    name: "Industrial area",
    type: "polygon",
    filter: "landuse = 'industrial'",
  },
  {
    name: "Body of water",
    type: "polygon",
    filter: "water IS NOT null",
  },
  {
    name: "Forest",
    type: "polygon",
    filter: "landuse = 'forest' OR planet_osm_polygon.natural = 'forest'",
  },
  {
    name: "Farmland",
    type: "polygon",
    filter: "landuse = 'farmland'",
  },
  {
    name: "Building",
    type: "polygon",
    filter: "building IS NOT null",
  },
  {
    name: "Building (1 story)",
    type: "polygon",
    filter: "tags->'building:levels' = '1'",
  },
  {
    name: "Building (2 story)",
    type: "polygon",
    filter: "tags->'building:levels' = '2'",
  },
  {
    name: "Building (3 story)",
    type: "polygon",
    filter: "tags->'building:levels' = '3'",
  },
  {
    name: "Building (4 story)",
    type: "polygon",
    filter: "tags->'building:levels' = '4'",
  },
  {
    name: "Building (5+ stories)",
    type: "polygon",
    filter: "(tags->'building:levels')::integer >= 5",
  },
  {
    name: "Beach",
    type: "polygon",
    filter: "planet_osm_polygon.natural = 'beach'",
  },
  {
    name: "Military",
    type: "polygon",
    filter: "military IS NOT null OR landuse = 'military'",
  },
];
