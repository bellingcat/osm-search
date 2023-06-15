<template>
  <v-main v-if="$store.state.user">
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

<script>
import SearchResults from "../components/SearchResults.vue";
import SearchControls from "../components/SearchControls.vue";

export default {
  name: "HomeView",
  components: {
    SearchResults,
    SearchControls,
  },
};
</script>
