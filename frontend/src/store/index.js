import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
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
    user: false,
    mapCenter: [42.2, -71.7],
    mapZoom: 8,
    responseTime: null,
  },
  mutations: {
    initializeCredentials(state) {
      if (localStorage.getItem("token")) {
        const user = JSON.parse(localStorage.getItem("user"));

        if (Math.floor(Date.now() / 1000) > user.exp) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          state.token = localStorage.getItem("token");
          state.user = JSON.parse(localStorage.getItem("user"));
        }
      }
    },
    signOut(state) {
      localStorage.removeItem("token");
      state.token = false;
      state.user = false;
    },
    setUser(state, { token, user }) {
      state.token = token;
      state.user = user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    updateSelected(state, value) {
      state.selected = [...value];
    },
    setSearchResults(state, data) {
      state.searchResults = data;
    },
    setBbox(state, bbox) {
      state.bbox = bbox;
    },
    setRange(state, range) {
      state.range = range;
    },
    setHoveredResult(state, index) {
      state.hovered = index;
    },
    setSelectedResult(state, index) {
      state.selectedResult = index;
    },
    setMode(state, mode) {
      state.mode = mode;
    },
    setLoading(state, loading) {
      state.loading = loading;
    },
    setError(state, error) {
      state.error = error;
    },
    setCenter(state, center) {
      state.mapCenter = center;
    },
    setZoom(state, zoom) {
      state.mapZoom = zoom;
    },
    setResponseTime(state, t) {
      state.responseTime = t;
    },
  },
  actions: {
    search({ state, commit }) {
      let bbox = state.bbox;
      let range = state.range;
      let filters = JSON.stringify(state.selected);

      commit("setLoading", true);

      let time1 = performance.now();

      fetch(
        `https://api.baarle-hertog.xyz/intersection?l=${bbox[0][1]}&b=${bbox[0][0]}&r=${bbox[1][1]}&t=${bbox[1][0]}&buffer=${range}&filters=${filters}`,
        {
          headers: {
            Authorization: "Bearer " + state.token,
          },
        }
      )
        .then((d) => d.json())
        .then((data) => {
          let time2 = performance.now();
          commit("setResponseTime", time2 - time1);
          commit("setSearchResults", data);
          commit("setLoading", false);
          commit("setError", false);
        })
        .catch(() => {
          commit("setLoading", false);
          commit(
            "setError",
            "Search error. Check your custom features or email logan@bellingcat.com."
          );
        });
    },
  },
  modules: {},
});
