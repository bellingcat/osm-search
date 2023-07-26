<template>
  <v-container>
    <v-row style="padding: 0.75em">
      <HelpCard />
    </v-row>
    <FeatureSelector />
    <v-alert
      type="error"
      style="padding: 0.75em; margin-top: 1em"
      v-if="$store.state.selected.length < 1"
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
            <template v-slot:thumb-label="{ value }"> {{ value }}m </template>
          </v-slider>
        </v-card-text>
      </v-card>
    </v-row>
    <v-row style="padding: 0.75em">
      <v-card style="width: 100%">
        <v-card-title>Search area</v-card-title>
        <l-map
          :zoom.sync="zoom"
          :center.sync="center"
          style="width: 100%; height: 600px"
          ref="map"
          :noBlockingAnimations="true"
        >
          <l-tile-layer :url="url" />
          <l-circle-marker
            v-for="(result, i) in $store.state.searchResults"
            :lat-lng="[result.lat, result.lng]"
            :key="'marker' + i"
            :radius="4"
            :color="
              i == $store.state.hovered
                ? '#673AB7'
                : i == $store.state.selectedResult
                ? '#E91E63'
                : '#2196F3'
            "
            @mouseover="$store.commit('setHoveredResult', i)"
            @mouseleave="$store.commit('setHoveredResult', null)"
            @click="mapClick(i)"
          />
          <l-rectangle
            v-if="$store.state.bbox.length > 0"
            :bounds="$store.state.bbox"
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
      v-if="$store.state.error"
    >
      {{ $store.state.error }}
    </v-alert>
  </v-container>
</template>

<script>
import { LMap, LTileLayer, LCircleMarker, LRectangle } from "vue2-leaflet";
import FeatureSelector from "./FeatureSelector.vue";
import HelpCard from "./HelpCard.vue";

export default {
  name: "SearchControls",
  components: {
    LMap,
    LTileLayer,
    LCircleMarker,
    LRectangle,
    FeatureSelector,
    HelpCard,
  },
  data() {
    return {
      locationSearch: "",
    };
  },
  computed: {
    range: {
      get() {
        return this.$store.state.range;
      },
      set(val) {
        this.$store.commit("setRange", val);
      },
    },
    center: {
      get() {
        return this.$store.state.mapCenter;
      },
      set(val) {
        this.$store.commit("setCenter", val);
      },
    },
    zoom: {
      get() {
        return this.$store.state.mapZoom;
      },
      set(val) {
        this.$store.commit("setZoom", val);
      },
    },
    url() {
      if (this.$store.state.mode == "google") {
        return "http://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
      } else if (this.$store.state.mode == "terrain") {
        return "http://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}";
      } else if (this.$store.state.mode == "satellite") {
        return "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiYmVsbGluZ2NhdC1tYXBib3giLCJhIjoiY2w4c201OGZsMHdkOTNwbWhkb3I4dGE2cCJ9.GFxMJQJ-dV7VRBAcTTHOzg";
      } else {
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      }
    },
  },
  methods: {
    search() {
      if (this.zoom < 6) {
        return;
      }

      let bounds = this.$refs.map.mapObject.getBounds();

      let bbox = [
        [bounds._southWest.lat, bounds._southWest.lng],
        [bounds._northEast.lat, bounds._northEast.lng],
      ];

      this.$store.commit("setBbox", bbox);
      this.$store.dispatch("search");
    },
    mapClick(i) {
      this.$store.commit("setSelectedResult", i);
      console.log("scrolling?");
      document
        .getElementById("result" + i)
        .scrollIntoView({ behavior: "smooth" });
    },
    searchLocation() {
      this.$store.dispatch("searchLocation", this.locationSearch);
      this.locationSearch = "";
    },
  },
};
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
