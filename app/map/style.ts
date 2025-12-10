// Dark maritime intelligence map style
// References CSS variables from globals.css

export const maritimeStyle: mapboxgl.Style = {
  version: 8,
  name: "Baltic Maritime Intelligence",
  glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
  sources: {
    "mapbox-streets": {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8",
    },
  },
  layers: [
    // Background
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#0d1117",
      },
    },

    // Water - deep charcoal blue
    {
      id: "water",
      type: "fill",
      source: "mapbox-streets",
      "source-layer": "water",
      paint: {
        "fill-color": "#161b22",
        "fill-opacity": 1,
      },
    },

    // Water pattern overlay for texture
    {
      id: "water-shadow",
      type: "fill",
      source: "mapbox-streets",
      "source-layer": "water",
      paint: {
        "fill-color": "#0d1117",
        "fill-opacity": 0.3,
      },
    },

    // Land - dark grey (landuse covers parks, residential, industrial, etc.)
    {
      id: "land",
      type: "fill",
      source: "mapbox-streets",
      "source-layer": "landuse",
      paint: {
        "fill-color": "#21262d",
        "fill-opacity": 0.8,
      },
    },

    // National parks / protected areas (subtle)
    {
      id: "national-park",
      type: "fill",
      source: "mapbox-streets",
      "source-layer": "landuse",
      filter: ["==", "class", "national_park"],
      paint: {
        "fill-color": "#1c2128",
        "fill-opacity": 0.4,
      },
    },

    // Coastlines
    {
      id: "coastline",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "water",
      paint: {
        "line-color": "#3d444d",
        "line-width": 1,
        "line-opacity": 0.6,
      },
    },

    // Admin boundaries - country borders (subtle)
    {
      id: "admin-country",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "admin",
      filter: ["==", "admin_level", 0],
      paint: {
        "line-color": "#484f58",
        "line-width": 0.8,
        "line-opacity": 0.5,
        "line-dasharray": [3, 2],
      },
    },

    // Admin boundaries - state/region (very subtle)
    {
      id: "admin-state",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "admin",
      filter: ["==", "admin_level", 1],
      minzoom: 4,
      paint: {
        "line-color": "#30363d",
        "line-width": 0.5,
        "line-opacity": 0.3,
        "line-dasharray": [2, 2],
      },
    },

    // Roads - only major highways, very subtle
    {
      id: "roads-major",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "road",
      filter: ["in", "class", "motorway", "trunk"],
      minzoom: 6,
      paint: {
        "line-color": "#30363d",
        "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.5, 12, 1.5],
        "line-opacity": 0.4,
      },
    },

    // Cities - major (at lower zooms)
    {
      id: "place-city",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "place_label",
      filter: ["==", "class", "city"],
      minzoom: 3,
      maxzoom: 14,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          3,
          10,
          8,
          14,
          12,
          16,
        ],
        "text-transform": "uppercase",
        "text-letter-spacing": 0.1,
        "text-max-width": 10,
      },
      paint: {
        "text-color": "#c9d1d9",
        "text-opacity": 0.8,
        "text-halo-color": "#0d1117",
        "text-halo-width": 1.5,
        "text-halo-blur": 1,
      },
    },

    // Towns - smaller places (at higher zooms)
    {
      id: "place-town",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "place_label",
      filter: ["==", "class", "town"],
      minzoom: 7,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 7, 9, 12, 12],
        "text-max-width": 8,
      },
      paint: {
        "text-color": "#8b949e",
        "text-opacity": 0.7,
        "text-halo-color": "#0d1117",
        "text-halo-width": 1,
      },
    },

    // Country labels
    {
      id: "country-label",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "place_label",
      filter: ["==", "class", "country"],
      minzoom: 2,
      maxzoom: 8,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 2, 10, 6, 16],
        "text-transform": "uppercase",
        "text-letter-spacing": 0.15,
      },
      paint: {
        "text-color": "#6e7681",
        "text-opacity": 0.6,
        "text-halo-color": "#0d1117",
        "text-halo-width": 2,
      },
    },

    // Water labels (seas, oceans)
    {
      id: "water-label",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "natural_label",
      filter: ["in", "class", "water", "sea", "ocean"],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Italic", "Arial Unicode MS Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 3, 12, 8, 16],
        "text-letter-spacing": 0.2,
        "text-max-width": 10,
      },
      paint: {
        "text-color": "#388bfd",
        "text-opacity": 0.5,
        "text-halo-color": "#0d1117",
        "text-halo-width": 1,
      },
    },

    // Ports and maritime POIs
    {
      id: "poi-port",
      type: "symbol",
      source: "mapbox-streets",
      "source-layer": "poi_label",
      filter: ["in", "class", "ferry_terminal", "port"],
      minzoom: 8,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "text-size": 10,
        "text-anchor": "top",
        "text-offset": [0, 0.5],
      },
      paint: {
        "text-color": "#58a6ff",
        "text-opacity": 0.8,
        "text-halo-color": "#0d1117",
        "text-halo-width": 1,
      },
    },
  ],
};

export default maritimeStyle;
