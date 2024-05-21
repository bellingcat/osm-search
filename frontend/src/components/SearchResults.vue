<template>
  <v-container>
    <v-card :loading="store.loading" variant="flat">
      <v-card-title> Results </v-card-title>
      <v-card-subtitle>
        {{ store.searchResults.length + (hasMore ? " (more available)" : "")
        }}<br />
        Load time {{ (store.responseTime / 1000).toFixed(2) }} seconds
      </v-card-subtitle>
      <v-card-actions>
        <v-row class="justify-start mx-2">
          <v-btn text @click="csv" variant="outlined">Export as CSV</v-btn>
          <v-btn text @click="kml" variant="outlined">Export as KML</v-btn>
        </v-row>
      </v-card-actions>
      <v-card-text>
        <v-card variant="outlined">
          <v-virtual-scroll
            :items="store.searchResults || []"
            height="60vh"
            key-field="index"
            class="scroller"
          >
            <template v-slot:default="{ item }">
              <SearchResult :result="item" />
            </template>
          </v-virtual-scroll>
        </v-card>
      </v-card-text>
      <v-card-actions v-if="hasMore">
        <v-row class="justify-center">
          <v-btn @click="next" prepend-icon="mdi-dots-horizontal" stacked>
            Load more
          </v-btn>
        </v-row>
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

const hasMore = computed(() => {
  return store.hasMore;
});

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
.scroller {
  height: 100%;
  overflow-y: auto;
}
</style>
