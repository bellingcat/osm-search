<template>
  <v-container>
    <v-card :loading="store.loading">
      <v-card-title>
        {{ "Page: " + (store.page + 1) }}
        {{ "Results: " + store.searchResults.length }}
        <span class="timing">{{
          "in " + (store.responseTime / 1000).toFixed(2) + " seconds"
        }}</span>
        <v-spacer></v-spacer>
        <v-btn icon @click="previous" :disabled="!canGoBack">
          <v-icon>mdi-arrow-left-bold</v-icon>
        </v-btn>
        <v-btn icon @click="next" :disabled="!hasMore">
          <v-icon>mdi-arrow-right-bold</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-radio-group v-model="mode" row>
          <v-radio label="OSM" value="osm" />
          <v-radio label="Google" value="google" />
          <v-radio label="Terrain" value="terrain" />
          <v-radio label="Satellite" value="satellite" />
        </v-radio-group>
        <div class="results">
          <v-row>
            <SearchResult
              v-for="(result, i) in store.searchResults || []"
              :key="'result' + i"
              :result="result"
              :resultIndex="i"
              :index="i"
            />
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="csv">Export as CSV</v-btn>
        <v-btn text @click="kml">Export as KML</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import tokml from "tokml";
import { saveAs } from "file-saver";
import { mkConfig, generateCsv } from "export-to-csv";
import { useAppStore } from "@/stores/app";
import { computed } from "vue";

const store = useAppStore();

const mode = computed({
  get() {
    return store.mode;
  },
  set(mode) {
    store.setMode(mode);
  },
});
const hasMore = computed(() => {
  return store.hasMore;
});
const canGoBack = computed(() => {
  return store.page > 0;
});

function previous() {
  store.previousPage();
}
function next() {
  store.nextPage();
}
function kml() {
  let features = store.searchResults.map((f) => ({
    type: "Feature",
    properties: { name: f.name },
    geometry: {
      type: "Point",
      coordinates: [f.lng, f.lat],
    },
  }));

  let geojson = { type: "FeatureCollection", features };
  let kml = tokml(geojson);

  saveAs(
    new Blob([kml], { type: "text/plain;charset=utf-8" }),
    "osm-search.kml",
  );
}
function csv() {
  const options = mkConfig({
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    showTitle: false,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
    filename: "osm-search",
  });

  const csvExporter = generateCsv(options);

  csvExporter.generateCsv(
    store.searchResults.map((f) => ({
      name: f.name,
      lat: f.lat,
      lng: f.lng,
    })),
  );
}
</script>

<style>
.results {
  display: flex;
  flex-wrap: wrap;
}

.timing {
  font-size: 80%;
  color: #444;
  margin-left: 1em;
  margin-bottom: -6px;
}
</style>
