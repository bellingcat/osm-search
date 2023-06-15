import Vue from "vue";
import App from "./App.vue";
import store from "./store";

import "leaflet/dist/leaflet.css";
import vuetify from "./plugins/vuetify";
import router from "./router";

Vue.config.productionTip = false;

new Vue({
  store,
  vuetify,

  beforeCreate() {
    this.$store.commit("initializeCredentials");
  },

  router,
  render: (h) => h(App),
}).$mount("#app");
