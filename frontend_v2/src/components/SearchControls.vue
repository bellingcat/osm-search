<template>
  <v-container>
    <HelpCard />
    <FeatureSelector />
    <v-alert
      type="error"
      style="padding: 0.75em; margin-top: 1em"
      v-if="store.selected.length < 1"
    >
      Select at least one feature to begin a search.
    </v-alert>
    <v-row style="padding: 0.75em">
      <v-card style="width: 100%">
        <v-card-title>Maximum distance between features</v-card-title>
        <v-card-text>
          <v-slider
            v-model="range"
            thumb-label="always"
            :thumb-size="36"
            :max="500"
            style="margin-bottom: -1em; margin-top: 1em"
            label="Longer distance will take longer to search"
          >
            <template v-slot:thumb-label="{ value }">
              {{ Math.round(range) }}m
            </template>
          </v-slider>
        </v-card-text>
      </v-card>
    </v-row>
    <v-row style="padding: 0.75em">
      <v-card style="width: 100%">
        <v-card-title>Search area</v-card-title>
        <l-map
          v-model:zoom="zoom"
          :center="[48.41322, 7.219482]"
          style="width: 100%; height: 600px"
          ref="map"
          :noBlockingAnimations="true"
        >
          <l-tile-layer :url="url" />
          <l-circle-marker
            v-for="(result, i) in store.searchResults"
            :lat-lng="[result.lat, result.lng]"
            :key="'marker' + i"
            :radius="4"
            :color="
              i == store.hovered
                ? '#673AB7'
                : i == store.selectedResult
                  ? '#E91E63'
                  : '#2196F3'
            "
            @mouseover="store.setHoveredResult(i)"
            @mouseleave="store.setHoveredResult(null)"
            @click="mapClick(i)"
          />
          <l-rectangle
            v-if="store.bbox.length > 0"
            :bounds="store.bbox"
            :fill="false"
            color="blue"
            :weight="3"
          ></l-rectangle>
        </l-map>
        <div class="map-search">
          <v-text-field
            variant="outlined"
            label="Find location"
            prepend-inner-icon="mdi-magnify"
            @keypress.enter="searchLocation"
            v-model="locationSearch"
          ></v-text-field>
        </div>
      </v-card>
    </v-row>
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
    <v-row style="padding: 0.75em">
      <v-btn @click="search">Search</v-btn>
    </v-row>
    <v-alert
      type="error"
      style="padding: 0.75em; margin-top: 1em"
      v-if="store.error"
    >
      {{ store.error }}
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import L from "leaflet";
import {
  LMap,
  LTileLayer,
  LCircleMarker,
  LRectangle,
} from "@vue-leaflet/vue-leaflet";
import FeatureSelector from "./FeatureSelector.vue";
import HelpCard from "./HelpCard.vue";
import { useAppStore } from "@/stores/app";
import { ref, computed, onMounted } from "vue";

const locationSearch = ref("");
const store = useAppStore();
const map: any = ref(null);

const range = computed({
  get() {
    return store.range;
  },
  set(val) {
    store.setRange(val);
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
  if (store.mode == "google") {
    return "http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
  } else if (store.mode == "terrain") {
    return "http://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}";
  } else if (store.mode == "satellite") {
    return "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiYmVsbGluZ2NhdC1tYXBib3giLCJhIjoiY2w4c201OGZsMHdkOTNwbWhkb3I4dGE2cCJ9.GFxMJQJ-dV7VRBAcTTHOzg";
  } else {
    return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  }
});

async function search() {
  if (zoom.value < 6) {
    return;
  }

  if (!map.value) {
    return;
  }

  let bounds = map.value.leafletObject.getBounds();

  let bbox = [
    [bounds._southWest.lat, bounds._southWest.lng],
    [bounds._northEast.lat, bounds._northEast.lng],
  ];

  await store.setBbox(bbox);
  store.search();
}
function mapClick(i) {
  store.setSelectedResult(i);
  console.log("scrolling?");
  document.getElementById("result" + i).scrollIntoView({ behavior: "smooth" });
}
function searchLocation() {
  store.searchLocation(locationSearch.value);
  locationSearch.value = "";
}
</script>

<style scoped>
.map-search {
  position: absolute;
  top: 0.25em;
  right: 0.5em;
  z-index: 1000;
  width: 300px;
}
</style>
