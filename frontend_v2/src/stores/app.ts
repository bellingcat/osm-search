// Utilities
import { defineStore } from "pinia";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { firebaseFirestore } from "../services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import queries from "@/assets/queries";
import { bellingCatService } from "../services/bellingcat.service";
import { osmService } from "../services/openstreetmap.service";
import { mapboxService } from "../services/mapbox.service";

interface State {
  selected: any[];
  searchResults: any[];
  bbox: number[];
  error: boolean | string;
  range: number;
  hovered: any | null;
  selectedResult: any | null;
  mode: string;
  loading: boolean;
  token: boolean;
  mapCenter: number[];
  mapZoom: number;
  responseTime: number | null;
  osmKeys: any[];
  selectedKeyValues: any[];
  user: any | null;
  presets: typeof queries;
  customPresets: any[];
  page: number;
  hasMore: boolean;
}

export const useAppStore = defineStore("app", {
  state: (): State => ({
    selected: [],
    searchResults: [],
    bbox: [],
    error: false,
    range: 100,
    hovered: null,
    selectedResult: null,
    mode: "osm",
    loading: false,
    token: false,
    mapCenter: [42.2, -71.7],
    mapZoom: 8,
    responseTime: null,
    osmKeys: [],
    selectedKeyValues: [],
    user: null,
    presets: queries,
    customPresets: [],
    page: 0,
    hasMore: false,
  }),
  actions: {
    setUser(user) {
      this.user = user;
    },
    setToken(token) {
      this.token = token;
      bellingCatService.setToken(token);
    },
    updateSelected(value) {
      this.selected = [...value];
    },
    removeSelected(index) {
      const value = this.selected;
      const newValue = [
        ...value.slice(0, index),
        ...value.slice(index + 1, value.length),
      ];
      this.selected = newValue;
    },
    setSearchResults(data) {
      this.searchResults = data;
    },
    setBbox(bbox) {
      this.bbox = bbox;
    },
    setRange(range) {
      this.range = range;
    },
    setHoveredResult(index) {
      this.hovered = index;
    },
    setSelectedResult(index) {
      this.selectedResult = index;
    },
    setMode(mode) {
      this.mode = mode;
    },
    setLoading(loading) {
      this.loading = loading;
    },
    setError(error) {
      this.error = error;
    },
    setMapPosition({ center, zoom }) {
      this.mapCenter = center;
      this.mapZoom = zoom;
    },
    setZoom(zoom) {
      this.mapZoom = zoom;
    },
    setCenter(center) {
      this.mapCenter = center;
    },
    setResponseTime(t) {
      this.responseTime = t;
    },
    setSelectedKeyValues(values) {
      this.selectedKeyValues = values;
    },
    setCustomPresets(presets) {
      this.customPresets = presets;
    },
    setPage(page) {
      this.page = page;
    },
    removeResult(index) {
      const newResults = this.searchResults.filter((_, i) => i !== index);
      this.searchResults = newResults;
    },

    async signout() {
      try {
        await firebase.auth().signOut();
        console.log("User is signed out from firebase.");

        // clean user from store
        this.$reset;
      } catch (error) {
        console.error("signOutUser (firebase/auth.js): ", error);
      }
    },

    nextPage() {
      this.page++;
      this.search();
    },

    previousPage() {
      this.page--;
      this.search();
    },

    async getKeys() {
      osmService.getKeys().then((data) => {
        this.osmKeys = data.data.map((d) => d.key);
      });
    },

    async getValues(v) {
      this.selectedKeyValues = [];
      if (v == "" || v == undefined || v == null) {
        return;
      }

      osmService.getValues(v).then((data) => {
        this.selectedKeyValues = data.data
          .filter((d) => d.fraction > 0.002)
          .map((d) => d.value);
      });
    },

    async search() {
      const bbox = this.bbox;
      const range = this.range;
      const filters = JSON.stringify(this.selected);
      const page = this.page;

      this.loading = true;
      try {
        const { data, responseTime, hasMore } = await bellingCatService.search({
          bbox,
          range,
          filters,
          page,
          prefetchNext: true,
        });
        this.responseTime = responseTime;
        this.searchResults = data;
        this.hasMore = hasMore;
        this.loading = false;
        this.error = false;
      } catch (e) {
        this.loading = false;
        this.error = e;
      }
    },

    async searchLocation(search_text) {
      const locationData = await mapboxService.searchLocation(search_text);
      let zoom = 14;

      if (locationData.features[0].bbox) {
        const maxBounds = Math.max(
          locationData.features[0].bbox[2] - locationData.features[0].bbox[0],
          locationData.features[0].bbox[3] - locationData.features[0].bbox[1],
        );

        zoom = Math.round(9 - Math.log2(maxBounds));
      }

      this.mapPosiion = {
        center: [
          locationData.features[0].center[1],
          locationData.features[0].center[0],
        ],
        zoom,
      };
    },

    async savePreset({ index, name }) {
      try {
        const docRef = await addDoc(collection(firebaseFirestore, "presets"), {
          filters: this.selected[index].filters,
          method: this.selected[index].method,
          type: this.selected[index].type,
          name: name,
          author_uid: this.user.uid,
          timestamp: serverTimestamp(),
        });

        console.log("Document written with ID: ", docRef.id);

        await this.getCustomPresets();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    },

    async getCustomPresets() {
      const q = query(
        collection(firebaseFirestore, "presets"),
        where("author_uid", "==", this.user.uid),
      );
      const querySnapshot = await getDocs(q);

      const customPresets = querySnapshot.docs.map((d) => ({
        ...d.data(),
        id: d.id,
      }));
      this.customPresets = customPresets;
    },

    async removePreset(id) {
      await deleteDoc(doc(firebaseFirestore, "presets", id));
      await this.getCustomPresets();
    },
  },
});
