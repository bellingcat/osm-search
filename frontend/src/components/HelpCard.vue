<template>
  <v-card style="width: 100%">
    <v-card-title>Getting started</v-card-title>
    <v-card-text :class="{ collapsed: !expanded, help: true }">
      <p>
        With the OpenStreetMap search tool, a researcher can find geolocation
        leads by searching for proximate features on OpenStreetMap.
      </p>

      <p>
        Select features from the list that are found within a certain maximum
        distance of each other. Adjust the map to contain the area that you want
        to search, and press the search button. Large queries may take a minute
        to run — to increase the speed search a smaller area by zooming in on
        the map. Results can be browsed directly, opened in Google Maps by
        clicking the lat/lng, or downloaded as a CSV or KML file.
      </p>

      <p>
        For more information, and a guide to creating searching custom features,
        read the associated article (coming soon.)
      </p>

      <p>
        OpenStreetMap is very detailed but accuracy and completeness varies
        significantly around the world. This tool can be used to find possible
        leads, but it should not be considered exhaustive or used to exclude
        areas of interest. For any bugs or new preset requests, contact
        <a href="mailto:logan@bellingcat.com">logan@bellingcat.com</a>.
      </p>
    </v-card-text>
    <div class="readmore" @click="toggle" v-if="!expanded">
      <div>Read more help</div>
      <!-- <v-btn icon> -->
      <v-icon>{{ expanded ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      <!-- </v-btn> -->
    </div>
    <div class="readmore" @click="toggle" v-if="expanded">
      <div>Close help</div>
      <!-- <v-btn icon> -->
      <v-icon>{{ expanded ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
      <!-- </v-btn> -->
    </div>
  </v-card>
</template>

<script>
export default {
  name: "HelpCard",
  data() {
    return {
      expanded: false,
    };
  },
  methods: {
    toggle() {
      this.expanded = !this.expanded;
    },
  },
};
</script>

<style scoped>
.help.collapsed {
  max-height: 48px;
  overflow: hidden;
}

.help {
  transition: max-height 0.3s;
  max-height: 300px;
}

.readmore {
  position: absolute;
  bottom: -1.5em;
  /* background-color: white; */
  margin-left: calc(50% - 100px);
  width: 200px;
  text-align: center;
  text-shadow: 0px 0px 4px white;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 6em;
  color: rgb(0, 0, 0, 0.6);
  font-size: 0.875rem;
}

.readmore:hover {
  cursor: pointer;
  /* background-color: rgba(220, 220, 220, 0.9); */
  background-color: rgba(255, 255, 255, 0.9);
  color: rgb(0, 0, 0, 0.8);
}
</style>
