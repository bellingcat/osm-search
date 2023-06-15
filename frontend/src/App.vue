<template>
  <v-app>
    <v-app-bar style="flex-grow: 0" class="text-no-wrap">
      <v-toolbar-title
        ><router-link to="/" class="nodecoration"
          >Bellingcat OpenStreetMap search</router-link
        ></v-toolbar-title
      >
      <v-spacer />
      <google-login />
    </v-app-bar>
    <router-view></router-view>
    <v-footer class="legal">
      <router-link to="/privacy">Privacy Policy</router-link>
      <router-link to="/tos">Terms of Service</router-link>
    </v-footer>
  </v-app>
</template>

<script>
import GoogleLogin from "./components/GoogleLogin.vue";

export default {
  name: "App",
  components: {
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

.legal a {
  margin-left: 2em;
  margin-right: 2em;
  color: inherit !important;
}

.legal {
  justify-content: center;
}

.nodecoration {
  color: inherit !important;
  text-decoration: none !important;
}
</style>
