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
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
    };

    firebase.auth().onAuthStateChanged((user) => {
      this.$store.commit("setUser", user);
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
