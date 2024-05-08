<template>
  <v-container>
    <v-card :loading="$store.state.loading">
      <v-card-title>
        {{ "Page: " + ($store.state.page + 1) }}
        {{ "Results: " + $store.state.searchResults.length }}
        <span class="timing">{{
          "in " + ($store.state.responseTime / 1000).toFixed(2) + " seconds"
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
              v-for="(result, i) in $store.state.searchResults"
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

<script>
import SearchResult from "./SearchResult.vue";
import tokml from "tokml";
import { saveAs } from "file-saver";
import { ExportToCsv } from "export-to-csv";

export default {
  name: "SearchResults",
  components: {
    SearchResult,
  },
  computed: {
    mode: {
      get() {
        return this.$store.state.mode;
      },
      set(mode) {
        this.$store.commit("setMode", mode);
      },
    },
    hasMore() {
      return this.$store.getters["hasMore"];
    },
    canGoBack() {
      return this.$store.getters["page"] > 0;
    },
  },
  methods: {
    previous() {
      this.$store.dispatch("previousPage");
    },
    next() {
      this.$store.dispatch("nextPage");
    },
    kml() {
      let features = this.$store.state.searchResults.map((f) => ({
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
        "osm-search.kml"
      );
    },
    csv() {
      const options = {
        fieldSeparator: ",",
        quoteStrings: '"',
        decimalSeparator: ".",
        showLabels: true,
        showTitle: false,
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
        filename: "osm-search",
      };

      const csvExporter = new ExportToCsv(options);

      csvExporter.generateCsv(
        this.$store.state.searchResults.map((f) => ({
          name: f.name,
          lat: f.lat,
          lng: f.lng,
        }))
      );
    },
  },
};
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
