<template>
  <section id="firebaseui-auth-container"></section>
</template>

<script>
import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import "firebase/compat/auth";
import { firebaseConfig } from "@/firebase.js";

export default {
  name: "FirebaseLogin",
  mounted() {
    firebase.initializeApp(firebaseConfig);

    let ui = firebaseui.auth.AuthUI.getInstance();
    if (!ui) {
      ui = new firebaseui.auth.AuthUI(firebase.auth());
    }

    let uiConfig = {
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          signInMethod:
            firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
        },
      ],
    };

    firebase.auth().onAuthStateChanged((user) => {
      this.$store.commit("setUser", user);
      if (user) {
        user.getIdToken().then((token) => {
          this.$store.commit("setToken", token);
        });

        this.$store.dispatch("getCustomPresets");
      }
    });

    ui.start("#firebaseui-auth-container", uiConfig);
  },
};
</script>

<style>
#firebaseui-auth-container {
  margin-top: 1em;
}
</style>
