<template>
  <v-container>
    <v-row style="padding: 0.75em">
      <v-card style="width: 100%">
        <v-card-title>Getting started</v-card-title>
        <v-card-text>
          <p>
            With the OpenStreetMap search tool, a researcher can find
            geolocation leads by searching for specific objects on
            OpenStreetMap.
          </p>

          <p>
            To begin, drag a feature type from the presets list to the "Selected
            features" list. Adding multiple features will find only locations
            where those features are nearby each other. Set the maximum distance
            slider to adjust how far apart the features can be. Adjust the map
            to contain the area that you want to search, and press the search
            button. Some queries may take several minutes to run. To increase
            the speed, zoom in on the map to select a smaller area. Results can
            be browsed directly, opened in Google Maps by clicking the lat/lng,
            or downloaded as a CSV or KML file.
          </p>

          <p>
            OpenStreetMap is very detailed but accuracy and completeness varies
            significantly around the world. This tool can be used to find
            possible leads, but it should not be considered exhaustive or used
            to exclude areas of interest.
            <strong
              >Want to search for a type of feature that's not included on the
              list?</strong
            >
            Contact logan@bellingcat.com.
          </p>
        </v-card-text></v-card
      >
    </v-row>
    <feature-selector />
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

export default {
  name: "SearchControls",
  components: {
    LMap,
    LTileLayer,
    LCircleMarker,
    LRectangle,
    FeatureSelector,
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
        return "https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i70350780!3m12!2sen-US!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!4e0!23i1379903&key=AIzaSyAo0g0nZh5aOEhMW2S876KMjJ8OqaN-VwQ";
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
  },
};
</script>
