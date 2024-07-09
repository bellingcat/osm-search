<template>
  <GeoJsonVisualizer v-if="result.selected" v-for="(geometry) in geometries" :geojson="geometry"
    @click="mapClick(result.index)" />
  <l-circle-marker v-else :lat-lng="latLng" :key="'marker' + result.index" :radius="4" :color="color"
    @mouseover="store.setHoveredResult(index)" @mouseleave="store.setHoveredResult(null)"
    @click="mapClick(result.index)" />
</template>
<script setup lang="ts">
//https://github.com/vue-leaflet/vue-leaflet/issues/278
import L from "leaflet";
globalThis.L = L;

import { LCircleMarker } from "@vue-leaflet/vue-leaflet";
import { useAppStore, SearchResult } from "@/stores/app";
import { computed } from "vue";

const store = useAppStore();

const props = defineProps<{
  result: SearchResult,
}>();

const color = computed(() => {
  return props.result.hovered
    ? "#673AB7"
    : props.result.selected
      ? "#E91E63"
      : "#2196F3";
});

const latLng = computed(() => {
  return [props.result.lat, props.result.lng];
});

const index = computed(() => {
  return props.result.index;
});

function mapClick() {
  store.setSelectedResult(index);
  document
    .getElementById("result" + index)
    ?.scrollIntoView({ behavior: "smooth" });
}

const geometries = computed(() => {
  return props.result.geometry;
});

</script>
