<template>
  <v-card variant="flat" class="mt-4" :color="color">
    <v-card-title> Results </v-card-title>
    <v-card-subtitle>
      {{ store.searchResults.length + (hasMore ? " (more available)" : "")
      }}<br />
      Load time {{ (store.responseTime / 1000).toFixed(2) }} seconds
    </v-card-subtitle>
    <v-card-actions>
      <v-row class="justify-start mx-2">
        <v-btn text @click="csv" variant="outlined" rounded
          >Export as CSV</v-btn
        >
        <v-btn text @click="kml" variant="outlined" rounded
          >Export as KML</v-btn
        >
      </v-row>
    </v-card-actions>
    <v-card-text>
      <v-card variant="outlined">
        <v-card v-if="store.loading" height="60vh">
          <v-col style="height: 100%">
            <v-row class="justify-center align-center" style="height: 100%">
              <v-progress-circular
                indeterminate
                color="primary"
                size="100"
                class="mx-auto"
              ></v-progress-circular>
            </v-row>
          </v-col>
        </v-card>
        <v-card v-else-if="store.searchResults.length === 0" height="60vh">
          <v-col style="height: 100%">
            <v-row
              class="justify-center align-center text-center"
              style="height: 100%"
            >
              <v-col>
                <div>No results to show.</div>
                <v-btn @click="returnToSearch" variant="text" color="primary"
                  >Return to search</v-btn
                >
              </v-col>
            </v-row>
          </v-col>
        </v-card>
        <v-virtual-scroll
          :items="store.searchResults || []"
          height="60vh"
          v-else
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
</template>

<script setup lang="ts">
import tokml from "tokml";
import { saveAs } from "file-saver";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useAppStore } from "@/stores/app";
import { computed } from "vue";
import { useTheme } from "vuetify";

const emits = defineEmits(["return"]);

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

const theme = useTheme();
const color = computed(() => {
  return theme.global.current.value.dark ? "" : "#F5F5F5";
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
  }));

  const csvExporter = generateCsv(csvConfig);

  download(csvConfig)(csvExporter(data));
}

function returnToSearch() {
  emits("return");
}
</script>

<style>
.scroller {
  height: 100%;
  overflow-y: auto;
}
</style>
