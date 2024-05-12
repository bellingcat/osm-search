<template>
  <v-col>
    <v-card
      :id="'result' + index"
      class="result"
      :color="hovered ? '#D1C4E9' : selected ? '#F48FB1' : '#FFFFFF'"
      @mouseover="store.setHoveredResult(index)"
      @mouseleave="store.setHoveredResult(null)"
      @click="clicked"
    >
      <v-card-title>{{ resultIndex + 1 }} </v-card-title>
      <v-card-subtitle>
        {{ result.name }}
      </v-card-subtitle>
      <v-card-text>
        <div class="map">
          <l-map
            :zoom="17"
            :center="[result.lat, result.lng]"
            :options="{ zoomControl: false }"
            style="width: 180px; height: 100px"
          >
            <l-tile-layer :url="url" />
          </l-map>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          :href="`https://www.google.com/maps/search/?api=1&query=${result.lat},${result.lng}`"
          text
          target="_blank"
          >({{ result.lat.toFixed(5) }}, {{ result.lng.toFixed(5) }})</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script setup lang="ts">
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { useAppStore } from "@/stores/app";
import { computed } from "vue";

defineProps(["result", "resultIndex", "mode", "index"]);
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
const hovered = computed(() => {
  return props.index == store.hovered;
});
const selected = computed(() => {
  return props.index == store.selectedResult;
});

function clicked() {
  store.setSelectedResult(props.index);
  store.setMapPosition({
    center: [props.result.lat, props.result.lng],
    zoom: 14,
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
  background-color: #d1c4e9;
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

a.outlink {
  /* color: black !important; */
}

.outlink:hover {
  /* background-color: #ddd; */
}

.result .v-btn__content {
  user-select: all;
}
</style>
