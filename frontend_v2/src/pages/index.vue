<template>
  <v-main v-if="isLoggedIn">
    <SearchControls />
    <SearchResults />
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
import { computed } from "vue";
import { useAppStore } from "@/stores/app";

const store = useAppStore();

const isLoggedIn = computed(() => {
  return store.user != null;
});
</script>
