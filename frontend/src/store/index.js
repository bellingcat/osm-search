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
    osmKeys: [],
    selectedKeyValues: [],
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
    removeSelected(state, index) {
      let value = state.selected;
      let newValue = [
        ...value.slice(0, index),
        ...value.slice(index + 1, value.length),
      ];
      state.selected = newValue;
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
    setMapPosition(state, { center, zoom }) {
      state.mapCenter = center;
      state.mapZoom = zoom;
    },
    setResponseTime(state, t) {
      state.responseTime = t;
    },
    setKeys(state, keys) {
      state.osmKeys = keys;
    },
    setSelectedKeyValues(state, values) {
      state.selectedKeyValues = values;
    },
  },
  actions: {
    getKeys({ commit }) {
      fetch(
        "https://taginfo.openstreetmap.org/api/4/keys/all?page=1&rp=200&filter=in_wiki&sortname=count_all&sortorder=desc"
      )
        .then((d) => {
          if (d.status != 200) {
            return Promise.reject(Error(d.status));
          }
          return d.json();
        })
        .then((data) => {
          commit(
            "setKeys",
            data.data.map((d) => d.key)
          );
        });
    },
    getValues({ commit }, v) {
      commit("setSelectedKeyValues", []);
      if (v == "" || v == undefined || v == null) {
        return;
      }

      fetch(
        "https://taginfo.openstreetmap.org/api/4/key/values?rp=50&sortname=count_all&sortorder=desc&key=" +
          v
      )
        .then((d) => {
          if (d.status != 200) {
            return Promise.reject(Error(d.status));
          }
          return d.json();
        })
        .then((data) => {
          commit(
            "setSelectedKeyValues",
            data.data.filter((d) => d.fraction > 0.002).map((d) => d.value)
          );
        });
    },
    search({ state, commit }) {
      let bbox = state.bbox;
      let range = state.range;
      let filters = JSON.stringify(state.selected);

      commit("setLoading", true);

      let time1 = performance.now();

      fetch(
        // `http://localhost:5050/intersection?l=${bbox[0][1]}&b=${bbox[0][0]}&r=${bbox[1][1]}&t=${bbox[1][0]}&buffer=${range}&filters=${filters}`,

        `https://api.osm-search.bellingcat.com/intersection?l=${bbox[0][1]}&b=${bbox[0][0]}&r=${bbox[1][1]}&t=${bbox[1][0]}&buffer=${range}&filters=${filters}`,
        {
          headers: {
            Authorization: "Bearer " + state.token,
          },
        }
      )
        .then((d) => {
          if (d.status != 200) {
            return Promise.reject(Error(d.status));
          }
          return d.json();
        })
        .then((data) => {
          let time2 = performance.now();
          commit("setResponseTime", time2 - time1);
          commit("setSearchResults", data);
          commit("setLoading", false);
          commit("setError", false);
        })
        .catch((e) => {
          commit("setLoading", false);
          if (e.message == 400) {
            commit("setLoading", false);
            commit(
              "setError",
              "Your search area is too large, or your search timed out. Zoom in on a smaller area or change your search parameters. Adding a point feature (green) will increase speed."
            );
          } else {
            commit("setLoading", false);
            commit(
              "setError",
              "Search error. Check your custom features or email logan@bellingcat.com."
            );
          }
        });
    },
    searchLocation({ commit }, search_text) {
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${search_text}.json?access_token=pk.eyJ1IjoiYmVsbGluZ2NhdC1tYXBib3giLCJhIjoiY2tleW0wbWliMDA1cTJ5bzdkbTRraHgwZSJ9.GJQkjPzj8554VhR5SPsfJg`
      )
        .then((d) => {
          if (d.status != 200) {
            return Promise.reject(Error(d.status));
          }
          return d.json();
        })
        .then((data) => {
          let zoom = 14;

          if (data.features[0].bbox) {
            let maxBounds = Math.max(
              data.features[0].bbox[2] - data.features[0].bbox[0],
              data.features[0].bbox[3] - data.features[0].bbox[1]
            );

            zoom = Math.round(9 - Math.log2(maxBounds));
          }

          commit("setMapPosition", {
            center: [data.features[0].center[1], data.features[0].center[0]],
            zoom,
          });
        });
    },
  },
  modules: {},
});
