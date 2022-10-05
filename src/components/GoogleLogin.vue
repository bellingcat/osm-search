<template>
  <v-toolbar-items class="my-auto align-center">
    <div
      v-if="!$store.state.user"
      id="google-login-btn"
      v-google-identity-login-btn="{ clientId }"
      aria-label="Sign in with Google"
      key="login"
    ></div>
    <div style="display: flex" key="logout" v-else>
      <v-card
        class="login-button px-2 py-2 my-auto"
        outllined
        light
        color="white"
        style="margin-right: 1em"
      >
        <v-avatar size="24">
          <img :src="$store.state.user.picture" alt="Google profile picture" />
        </v-avatar>
        Signed in
      </v-card>
      <v-btn class="px-2 py-2 my-auto" @click="$store.commit('signOut')">
        Sign out
      </v-btn>
    </div>
  </v-toolbar-items>
</template>

<script>
import OneTap from "@/directives/OneTap.js";

export default {
  name: "GoogleLogin",

  directives: {
    OneTap,
  },

  data() {
    return {
      clientId:
        "919009657823-74o4l4qjo8ugebg9evb6are67q0ifd6j.apps.googleusercontent.com",
    };
  },

  methods: {
    onGoogleAuthSuccess(jwtCredentials) {
      const profileData = JSON.parse(atob(jwtCredentials.split(".")[1]));
      this.$store.commit("setUser", {
        token: jwtCredentials,
        user: profileData,
      });
      this.$store.commit("setError", false);

      if (
        !this.$store.state.channelsLoading &&
        this.$store.state.channels.length == 0
      ) {
        this.$store.dispatch("loadInitialData");
      }
    },
  },
};
</script>

<style>
@font-face {
  font-family: "GoogleSans";
  src: url("../assets/fonts/GoogleSans-Regular.ttf") format("truetype");
}

.login-button {
  font-family: "GoogleSans";
  font-size: 14px;
}
</style>
