/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";
// https://github.com/vue-leaflet/vue-leaflet/issues/371

// Components
import App from "./App.vue";
// Composables
import { createApp } from "vue";

//Styles
import "leaflet/dist/leaflet.css";

const app = createApp(App);

registerPlugins(app);

app.mount("#app");
