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
      <v-btn v-if="user" href="#" @click="store.signout()">Sign Out</v-btn>
    </v-app-bar>

    <FirebaseLogin v-if="!user" class="mt-16" />
    <router-view></router-view>

    <v-footer class="legal">
      <router-link to="/privacy">Privacy Policy</router-link>
      <router-link to="/tos">Terms of Service</router-link>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useAppStore } from "./stores/app";
import L from "leaflet";

const store = useAppStore();

onMounted(() => {
  store.getKeys();
});

const user = computed(() => {
  return store.user;
});
</script>

<style>
@font-face {
  font-family: GoogleSans;
  src: url("~@/assets/fonts/GoogleSans-Regular.ttf");
}
body {
  font-family: GoogleSans, Helvetica, Arial, sans-serif;
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
