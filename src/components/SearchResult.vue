<template>
  <v-col>
    <v-card
      :id="'result' + index"
      class="result"
      :color="hovered ? '#D1C4E9' : selected ? '#F48FB1' : '#FFFFFF'"
      @mouseover="$store.commit('setHoveredResult', index)"
      @mouseleave="$store.commit('setHoveredResult', null)"
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
        <!-- <a
          class="outlink"
          target="_blank"
          :href="`https://www.google.com/maps/search/?api=1&query=${result.lat},${result.lng}`"
        > -->
        <v-btn
          :href="`https://www.google.com/maps/search/?api=1&query=${result.lat},${result.lng}`"
          text
          target="_blank"
          >({{ result.lat.toFixed(5) }}, {{ result.lng.toFixed(5) }})</v-btn
        >
        <!-- </a> -->
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
import { LMap, LTileLayer } from "vue2-leaflet";

export default {
  name: "SearchResult",
  components: {
    LMap,
    LTileLayer,
  },
  props: {
    result: Object,
    resultIndex: Number,
    mode: String,
    index: Number,
  },
  computed: {
    url() {
      if (this.$store.state.mode == "google") {
        return "https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i70350780!3m12!2sen-US!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!4e0!23i1379903&key=AIzaSyAo0g0nZh5aOEhMW2S876KMjJ8OqaN-VwQ";
      } else if (this.$store.state.mode == "satellite") {
        return "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/{z}/{x}/{y}{r}?access_token=pk.eyJ1IjoiYmVsbGluZ2NhdC1tYXBib3giLCJhIjoiY2w4c201OGZsMHdkOTNwbWhkb3I4dGE2cCJ9.GFxMJQJ-dV7VRBAcTTHOzg";
      } else {
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      }
    },
    hovered() {
      return this.index == this.$store.state.hovered;
    },
    selected() {
      return this.index == this.$store.state.selectedResult;
    },
  },
  methods: {
    clicked() {
      this.$store.commit("setSelectedResult", this.index);
      this.$store.commit("setCenter", [this.result.lat, this.result.lng]);
      this.$store.commit("setZoom", 13);
    },
  },
};
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
