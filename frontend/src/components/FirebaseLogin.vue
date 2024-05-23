<template>
  <section id="firebaseui-auth-container"></section>
</template>

<script setup lang="ts">
import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
// Default styles import from gstatic which may be legally problematic in EU
import "@/styles/firebaseui.override.css";
import "firebase/compat/auth";
import { firebaseConfig } from "@/services/firebase";
import { useAppStore } from "@/stores/app";
import { onMounted } from "vue";

const store = useAppStore();

onMounted(() => {
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
    store.setUser(user);
    if (user) {
      user.getIdToken().then((token) => {
        store.setToken(token);
      });

      store.getCustomPresets();
    }
  });

  ui.start("#firebaseui-auth-container", uiConfig);
});
</script>

<style>
#firebaseui-auth-container {
  margin-top: 1em;
}
</style>
