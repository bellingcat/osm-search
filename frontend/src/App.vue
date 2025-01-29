<template>
  <v-app>
    <v-app-bar style="flex-grow: 0" class="text-no-wrap">
      <v-toolbar-title
        ><router-link to="/" class="nodecoration"
          >Bellingcat OpenStreetMap search</router-link
        ></v-toolbar-title
      >
      <v-spacer />
      <span class="user" v-if="user">
        {{ user.email }}
      </span>
      <v-btn v-if="user" href="#" @click="$store.dispatch('signout')"
        >Sign Out</v-btn
      >
    </v-app-bar>
    <router-view></router-view>
    <v-footer class="legal">
      <router-link to="/privacy">Privacy Policy</router-link>
      <router-link to="/tos">Terms of Service</router-link>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "App",
  // components: {
  //   FirebaseLogin,
  // },
  mounted() {
    this.$store.dispatch("getKeys");
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
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

.user {
  margin-right: 1em;
}
</style>
