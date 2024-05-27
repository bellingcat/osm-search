<template>
  <v-main v-if="isLoggedIn">
    <HelpCard />
    <v-row class="mt-0">
      <v-col cols="7" class="mx-0">
        <MainMap class="pr-0" />
      </v-col>
      <v-col cols=" 5" class="mt-3 mx-0">
        <v-tabs v-model="tab" align-tabs="center" fixed-tabs>
          <v-tab value="search" append-icon="mdi-map-search-outline">Search</v-tab>
          <v-tab value="results" append-icon="mdi-map-marker-multiple">Results</v-tab>
        </v-tabs>
        <v-tabs-window v-model="tab">
          <v-tabs-window-item value="search">
            <SearchControls @search="tab = 'results'" />
          </v-tabs-window-item>

          <v-tabs-window-item value="results">
            <SearchResults @return="tab = 'search'" />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-col>
    </v-row>
  </v-main>
  <v-main v-else>
    <v-container>
      <v-alert type="error" style="padding: 0.75em; margin-top: 1em">
        Please sign in to continue.
      </v-alert>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAppStore } from "@/stores/app";

const tab = ref("search");
const store = useAppStore();

const isLoggedIn = computed(() => {
  return store.user != null;
});
</script>
