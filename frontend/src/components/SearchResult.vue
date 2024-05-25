<template>
  <v-card :id="'result' + index" class="result ma-1" variant="tonal" :color="color"
    @mouseover="store.setHoveredResult(index)" @mouseleave="store.setHoveredResult(null)" @click="clicked">
    <v-card-title>
      <v-row>
        <v-spacer></v-spacer>
        <v-btn variant="plain" icon="mdi-delete" @click.stop="store.removeResult(index)" color="red">
        </v-btn>
      </v-row>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col class="align-center">
          <div class="map">
            <l-map :zoom="zoom" :center="latLng" :options="{ zoomControl: false }" style="width: 180px; height: 100px">
              <GeoJsonVisualizer v-for="(geometry) in geometries" :geojson="geometry" />
              <l-tile-layer :url="url" />
            </l-map>
          </div>
        </v-col>
        <v-col class="justify-center text-center">
          <div>
            {{ name || "&nbsp;"}}
          </div>
          <v-btn :href="`https://www.google.com/maps/search/?api=1&query=${result.lat},${result.lng}`" variant="text"
            append-icon="mdi-open-in-new" target="_blank">
            ({{ lat }}, {{ lng }})</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
//https://github.com/vue-leaflet/vue-leaflet/issues/278
import L from "leaflet";
globalThis.L = L;

import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { useAppStore, SearchResult } from "@/stores/app";
import { computed, ref } from "vue";

const zoom = ref(14)

const props = defineProps<{
  result: SearchResult,
}>();
const store = useAppStore();

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

const color = computed(() => {
  return props.result.hovered
    ? "#D1C4E9"
    : props.result.selected
      ? "#F48FB1"
      : "";
});

const latLng = computed(() => {
  return [props.result.lat, props.result.lng];
});

const name = computed(() => {
  return props.result.name;
});

const lat = computed(() => {
  return props.result.lat.toFixed(5);
});

const lng = computed(() => {
  return props.result.lng.toFixed(5);
});

const index = computed(() => {
  return props.result.index;
});

const geometries = computed(() => {
  return props.result.geometry;
});

function clicked() {
  store.setSelectedResult(index.value);
  store.setMapPosition({
    center: latLng.value,
  });
}
</script>

<style>
.map {
  pointer-events: none;
}

.result .leaflet-control-container {
  display: none;
}

.result:hover {
  background-color: #118833;
  cursor: default;
}

.index {
  font-size: 24px;
  font-weight: bold;
  width: 30px;
}

.name {
  width: 100px;
}

.result .v-card__text {
  padding: 8px;
}

.result .v-btn__content {
  user-select: all;
}
</style>
