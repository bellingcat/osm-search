<template>
  <v-app>
    <v-app-bar style="flex-grow: 0" class="text-no-wrap">
      <v-toolbar-title>Bellingcat OpenStreetMap search</v-toolbar-title>
      <v-spacer />
      <google-login />
    </v-app-bar>
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
    <v-footer>
      <a href="#">Privacy Policy</a>
      <a href="#">Terms of Use</a>
    </v-footer>
  </v-app>
</template>

<script>
import SearchResults from "./components/SearchResults.vue";
import SearchControls from "./components/SearchControls.vue";
import GoogleLogin from "./components/GoogleLogin.vue";

export default {
  name: "App",
  components: {
    SearchResults,
    SearchControls,
    GoogleLogin,
  },
  mounted() {
    this.$store.dispatch("getKeys");
  },
};
</script>

<style>
body {
  font-family: Helvetica, Arial, sans-serif;
}
</style>
