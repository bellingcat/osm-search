<template>
  <div>
    <v-card style="width: 100%" variant="text">
      <v-card-title class="mb-2">
        <v-row class="ma-2">
          Search area
          <v-spacer></v-spacer>
          <v-select
            v-model="mode"
            :items="mapModes"
            variant="outlined"
            density="compact"
            hide-details="true"
            label="Map mode"
            class="mx-2"
          >
          </v-select>
          <v-text-field
            variant="outlined"
            density="compact"
            hide-details="true"
            label="Find location"
            prepend-inner-icon="mdi-magnify"
            @keypress.enter="searchLocation"
            v-model="locationSearch"
          ></v-text-field>
        </v-row>
      </v-card-title>
      <v-card-text>
        <l-map
          v-model:zoom="zoom"
          :center="center"
          style="width: 100%; height: 80vh"
          ref="map"
          :noBlockingAnimations="true"
          @ready="updateBbox"
          @update:bounds="updateBbox"
        >
          <l-tile-layer :url="url" />
          <map-marker
            v-for="result in store.searchResults"
            :key="'marker' + result.index"
            :result="result"
          />
          <l-rectangle
            v-if="store.bbox.length > 0"
            :bounds="store.bbox"
            :fill="false"
            color="blue"
            :weight="3"
          ></l-rectangle>
        </l-map>
      </v-card-text>
    </v-card>
    <v-alert
      type="error"
      style="padding: 0.75em; margin-top: 1em"
      v-if="zoom < 6"
    >
      Your search area is too large. Zoom in to reduce the search area.
    </v-alert>
    <v-alert
      type="warning"
      style="padding: 0.75em; margin-top: 1em"
      v-else-if="zoom < 8"
    >
      Your search area is very large. You can still run it, but the search may
      fail or take a long time to execute. Zoom in to reduce the search area.
    </v-alert>
    <v-alert
      type="error"
      style="padding: 0.75em; margin-top: 1em"
      v-if="store.error"
    >
      {{ store.error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
//https://github.com/vue-leaflet/vue-leaflet/issues/278
import L from "leaflet";
globalThis.L = L;

import { LMap, LTileLayer, LRectangle } from "@vue-leaflet/vue-leaflet";
import { useAppStore } from "@/stores/app";
import { ref, computed } from "vue";

const locationSearch = ref("");
const store = useAppStore();
const map: any = ref(null);

const mode = computed({
  get() {
    return store.mode;
  },
  set(val) {
    store.setMode(val);
  },
});

const center = computed({
  get() {
    return store.mapCenter;
  },
  set(val) {
    store.setCenter(val);
  },
});

const zoom = computed({
  get() {
    return store.mapZoom;
  },
  set(val) {
    store.setZoom(val);
  },
});

const url = computed(() => {
  if (mode.value == "google") {
    return "http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  } else if (mode.value == "terrain") {
    return "http://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}";
  } else if (mode.value == "satellite") {
    return "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiYmVsbGluZ2NhdC1tYXBib3giLCJhIjoiY2w4c201OGZsMHdkOTNwbWhkb3I4dGE2cCJ9.GFxMJQJ-dV7VRBAcTTHOzg";
  } else {
    return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  }
});

const mapModes = [
  { title: "OSM", value: "osm" },
  { title: "Google", value: "google" },
  { title: "Terrain", value: "terrain" },
  { title: "Satellite", value: "satellite" },
];

function updateBbox() {
  if (!map.value) {
    return;
  }

  let bounds = map.value.leafletObject.getBounds();

  let bbox = [
    [bounds._southWest.lat, bounds._southWest.lng],
    [bounds._northEast.lat, bounds._northEast.lng],
  ];

  store.setBbox(bbox);
}

function searchLocation() {
  store.searchLocation(locationSearch.value);
  locationSearch.value = "";
}
</script>

<style scoped></style>
