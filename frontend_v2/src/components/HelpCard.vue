<template>
  <v-dialog v-model="isDialogShown" style="padding: 0.75em">

    <v-card class="pa-4" style="width: 100%">
      <v-card-title>Getting started</v-card-title>
      <v-card-text>
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
          read the <a
            href="https://www.bellingcat.com/resources/how-tos/2023/05/08/finding-geolocation-leads-with-bellingcats-openstreetmap-search-tool/"
            target="_blank"> article</a> </p>

        <p>
          OpenStreetMap is very detailed but accuracy and completeness varies
          significantly around the world. This tool can be used to find possible
          leads, but it should not be considered exhaustive or used to exclude
          areas of interest. For any bugs or new preset requests, contact
          <a href=" mailto:logan@bellingcat.com">logan@bellingcat.com</a>.
        </p>
        <div class="d-flex justify-center">
          <v-checkbox label="Do not show again" v-model="disableHelp"></v-checkbox>
        </div>
      </v-card-text>
      <v-card-actions class="text-center">
        <v-btn color="info"
          @click="close()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
const isDialogShown = ref(false)
const disableHelp = ref(false)

onMounted(() => {
  const isHelpDisabled = localStorage.getItem("isHelpDisabled")
  if (!Boolean(isHelpDisabled)) {
    isDialogShown.value = true;
  }
})


function close() {
  isDialogShown.value = false;
  localStorage.setItem('isHelpDisabled', disableHelp.value)
}
</script>

<style scoped>
p {
  margin: 8px 0px
}
</style>
