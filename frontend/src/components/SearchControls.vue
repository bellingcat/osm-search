<template>
  <div>
    <HelpCard />
    <v-card variant="flat" :color="color" class="mt-4">
      <FeatureSelector />
      <v-row>
        <v-card class="mx-4" variant="text" width="100%">
          <v-card-title>Maximum distance between features</v-card-title>
          <v-card-subtitle>
            Longer distance will take longer to search.<br />
          </v-card-subtitle>
          <v-card-text>
            <v-slider v-model="range" thumb-label="always" :max="500" step="1" class="mb-1 mt-4">
              <template v-slot:thumb-label> {{ range }}m </template>
            </v-slider>
          </v-card-text>
        </v-card>
      </v-row>
      <v-row class="justify-center mt-0 mb-6">
        <v-btn @click="search" size="x-large" color="green" :disabled="store.loading" rounded>Search</v-btn>
      </v-row>
      <v-alert type="error" class="mt-4" v-if="store.selected.length < 1">
        Select at least one feature to begin a search.
      </v-alert>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import FeatureSelector from "./FeatureSelector.vue";
import HelpCard from "./HelpCard.vue";
import { useAppStore } from "@/stores/app";
import { computed } from "vue";
import { useTheme } from "vuetify";

const store = useAppStore();

const emits = defineEmits(["search"]);

const range = computed({
  get() {
    return store.range;
  },
  set(val) {
    store.setRange(val);
  },
});

const theme = useTheme();
const color = computed(() => {
  return theme.global.current.value.dark ? "" : "#F5F5F5";
});

const zoom = computed(() => {
  return store.mapZoom;
});

async function search() {
  if (zoom.value < 6) {
    return;
  }
  emits("search");
  store.search();
}
</script>

<style scoped></style>
