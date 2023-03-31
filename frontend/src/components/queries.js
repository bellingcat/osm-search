export default [
  {
    name: "Power pylon",
    type: "point",
    method: "OR",
    filters: [
      {
        parameter: "power",
        comparison: "=",
        value: "tower",
      },
      {
        parameter: "power",
        comparison: "=",
        value: "pole",
      },
    ],
  },
  {
    name: "Public transport stop",
    type: "point",
    method: "OR",
    filters: [
      {
        parameter: "public_transport",
        comparison: "is not null",
      },
      {
        parameter: "highway",
        comparison: "=",
        value: "bus_stop",
      },
    ],
  },
  {
    name: "Church",
    type: "point",
    method: "OR",
    filters: [
      {
        parameter: "amenity",
        comparison: "=",
        value: "place_of_worship",
      },
    ],
  },
  {
    name: "Hospital",
    type: "point",
    method: "OR",
    filters: [
      {
        parameter: "amenity",
        comparison: "=",
        value: "hospital",
      },
    ],
  },
  {
    name: "Military",
    type: "point",
    method: "OR",
    filters: [
      {
        parameter: "military",
        comparison: "is not null",
      },
      {
        parameter: "landuse",
        comparison: "=",
        value: "military",
      },
    ],
  },
  {
    name: "Restaurant",
    type: "point",
    method: "OR",
    filters: [
      {
        parameter: "amenity",
        comparison: "=",
        value: "restaurant",
      },
      {
        parameter: "amenity",
        comparison: "=",
        value: "cafe",
      },
      {
        parameter: "amenity",
        comparison: "=",
        value: "pub",
      },
      {
        parameter: "amenity",
        comparison: "=",
        value: "fast_food",
      },
    ],
  },
  {
    name: "Waterway",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "waterway",
        comparison: "is not null",
      },
    ],
  },
  {
    name: "Road",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "highway",
        comparison: "is not null",
      },
    ],
  },
  {
    name: "Railroad",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "railway",
        comparison: "is not null",
      },
    ],
  },
  {
    name: "Bridge",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "bridge",
        comparison: "is not null",
      },
    ],
  },
  {
    name: "Road (motorway)",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "highway",
        comparison: "=",
        value: "motorway",
      },
      {
        parameter: "highway",
        comparison: "=",
        value: "motorway_link",
      },
    ],
  },
  {
    name: "Road (primary)",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "highway",
        comparison: "=",
        value: "primary",
      },
      {
        parameter: "highway",
        comparison: "=",
        value: "primary_link",
      },
    ],
  },
  {
    name: "Road (secondary)",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "highway",
        comparison: "=",
        value: "secondary",
      },
      {
        parameter: "highway",
        comparison: "=",
        value: "secondary_link",
      },
    ],
  },
  {
    name: "Road (residential)",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "highway",
        comparison: "=",
        value: "residential",
      },
    ],
  },
  {
    name: "Unpaved road",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "surface",
        comparison: "=",
        value: "unpaved",
      },
    ],
  },
  {
    name: "1-lane road",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "lanes",
        comparison: "=",
        value: "1",
      },
    ],
  },
  {
    name: "2-lane road",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "lanes",
        comparison: "=",
        value: "2",
      },
    ],
  },
  {
    name: "3-lane road",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "lanes",
        comparison: "=",
        value: "3",
      },
    ],
  },
  {
    name: "4-lane road",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "lanes",
        comparison: "=",
        value: "4",
      },
    ],
  },
  {
    name: "5-lane road",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "lanes",
        comparison: "=",
        value: "5",
      },
    ],
  },
  {
    name: "6-lane road",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "lanes",
        comparison: "=",
        value: "6",
      },
    ],
  },
  {
    name: "Sidewalk",
    type: "line",
    method: "AND",
    filters: [
      {
        parameter: "sidewalk",
        comparison: "is not null",
      },
      {
        parameter: "sidewalk",
        comparison: "!=",
        value: "no",
      },
    ],
  },
  {
    name: "Cliff",
    type: "line",
    method: "OR",
    filters: [
      {
        parameter: "natural",
        comparison: "=",
        value: "cliff",
      },
    ],
  },
  {
    name: "Park",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "leisure",
        comparison: "=",
        value: "park",
      },
    ],
  },
  {
    name: "Industrial area",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "landuse",
        comparison: "=",
        value: "industrial",
      },
    ],
  },
  {
    name: "Body of water",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "water",
        comparison: "is not null",
      },
    ],
  },
  {
    name: "Forest",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "landuse",
        comparison: "=",
        value: "forest",
      },
      {
        parameter: "natural",
        comparison: "=",
        value: "forest",
      },
    ],
  },
  {
    name: "Farmland",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "landuse",
        comparison: "=",
        value: "farmland",
      },
    ],
  },
  {
    name: "Building",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "building",
        comparison: "is not null",
      },
    ],
  },
  {
    name: "Building (1 story)",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "building:levels",
        comparison: "=",
        value: "1",
      },
    ],
  },
  {
    name: "Building (2 story)",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "building:levels",
        comparison: "=",
        value: "2",
      },
    ],
  },
  {
    name: "Building (3 story)",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "building:levels",
        comparison: "=",
        value: "3",
      },
    ],
  },
  {
    name: "Building (4 story)",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "building:levels",
        comparison: "=",
        value: "4",
      },
    ],
  },
  {
    name: "Building (5-9 stories)",
    type: "polygon",
    method: "AND",
    filters: [
      {
        parameter: "building:levels",
        comparison: ">=",
        value: "5",
        cast: "cast_to_float",
      },
      {
        parameter: "building:levels",
        comparison: "<",
        value: "10",
        cast: "cast_to_float",
      },
    ],
  },
  {
    name: "Building (10+ stories)",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "building:levels",
        comparison: ">=",
        value: "10",
        cast: "cast_to_float",
      },
    ],
  },
  {
    name: "Beach",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "natural",
        comparison: "=",
        value: "beach",
      },
    ],
  },
  {
    name: "Military",
    type: "polygon",
    method: "OR",
    filters: [
      {
        parameter: "military",
        comparison: "is not null",
      },
      {
        parameter: "landuse",
        comparison: "=",
        value: "military",
      },
    ],
  },
];
