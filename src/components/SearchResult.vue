<template>
  <div class="result">
    <div class="index">{{ resultIndex + 1 }}</div>
    <div class="name">
      {{ result.name }}
    </div>
    <div class="map">
      <l-map
        :zoom="16"
        :center="[result.lat, result.lng]"
        :options="{ zoomControl: false }"
        style="width: 200px; height: 100px"
      >
        <l-tile-layer :url="url" />
      </l-map>
    </div>
  </div>
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
  },
  computed: {
    url() {
      if (this.mode == "google") {
        return "https://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i70350780!3m12!2sen-US!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!4e0!23i1379903&key=AIzaSyAo0g0nZh5aOEhMW2S876KMjJ8OqaN-VwQ";
      } else if (this.mode == "satellite") {
        return "https://caltopo.com/tile/imagery/{z}/{x}/{y}.png";
      } else {
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      }
    },
  },
};
</script>

<style>
.map {
  pointer-events: none;
}

.result {
  display: flex;
  align-items: center;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.leaflet-control-container {
  display: none;
}

.index {
  font-size: 24px;
  font-weight: bold;
  width: 30px;
}

.name {
  width: 200px;
}
</style>
