<template>
  <v-container>
    <v-card variant="flat">
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
          <v-card v-if="store.loading" height="60vh">
            <v-col style="height: 100%">
              <v-row class="justify-center align-center" style="height: 100%">
                <v-progress-circular indeterminate color="primary" size="100" class="mx-auto"></v-progress-circular>

              </v-row>
            </v-col>
          </v-card> <v-virtual-scroll :items="store.searchResults || []" height="60vh" v-else key-field="index"
            class="scroller">
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
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useAppStore } from "@/stores/app";
import { computed } from "vue";

const store = useAppStore();
const csvConfig = mkConfig({
  fieldSeparator: ",",
  quoteStrings: true,
  quoteCharacter: '"',
  decimalSeparator: ".",
  showTitle: false,
  useTextFile: false,
  useBom: true,
  useKeysAsHeaders: true,
  filename: "osm-search",
});

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
  const data = store.searchResults.map(({ name, lat, lng }) => ({
    name,
    lat,
    lng,
  }))

  const csvExporter = generateCsv(csvConfig);

  download(csvConfig)(csvExporter(data));
}
</script>

<style>
.scroller {
  height: 100%;
  overflow-y: auto;
}
</style>
