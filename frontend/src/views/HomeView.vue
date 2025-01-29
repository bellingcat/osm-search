<template>
  <v-main v-if="$store.state.user">
    <SearchControls />
    <SearchResults />
  </v-main>
  <v-main v-else>
    <v-container>
      <v-card>
        <v-card-title>About</v-card-title>
        <v-card-text>
          <p>
            The Bellingcat OpenStreetMap search is a tool for assisting
            researchers and journalists with geolocation tasks by querying
            public
            <a href="https://www.openstreetmap.org/">OpenStreetMap</a> data.
            This tool is an alternative to more sophisticated and more
            complicated interfaces to the same data such as
            <a href="https://overpass-turbo.eu/">Overpass Turbo</a>.
          </p>
          <p>
            For more information and a guide to the tool's use, read
            Bellingcat's article
            <a
              href="https://www.bellingcat.com/resources/how-tos/2023/05/08/finding-geolocation-leads-with-bellingcats-openstreetmap-search-tool/"
              >"Finding Geolocation Leads with Bellingcat's OpenStreetMap Search
              Tool."</a
            >
          </p>
          <p>
            This tool is open to public use for journalism and education. All
            use is audited to ensure compliance with Bellingcat's
            <a href="/tos">Acceptable Use Policy</a>.
          </p></v-card-text
        >
      </v-card>
      <v-alert type="error" style="padding: 0.75em; margin-top: 1em">
        Please sign in to continue.
      </v-alert>
      <FirebaseLogin v-if="!user" />
    </v-container>
  </v-main>
</template>

<script>
import SearchResults from "../components/SearchResults.vue";
import SearchControls from "../components/SearchControls.vue";
import FirebaseLogin from "../components/FirebaseLogin.vue";

export default {
  name: "HomeView",
  components: {
    SearchResults,
    SearchControls,
    FirebaseLogin,
  },
};
</script>
