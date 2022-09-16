<template>
  <div id="app">
    <button @click="search">Search</button>
    <div class="results">
      <SearchResult
        v-for="(result, i) in results"
        :key="'result' + i"
        :result="result"
        :resultIndex="i"
        :mode="mode"
      />
    </div>
  </div>
</template>

<script>
import SearchResult from "./components/SearchResult.vue";

export default {
  name: "App",
  components: {
    SearchResult,
  },
  data() {
    return {
      results: [],
      mode: "google",
    };
  },
  methods: {
    search() {
      fetch(
        "http://127.0.0.1:5000/intersection?l=-71.9989&b=41&r=-69.5&t=43&buffer=50&point_filter=WHERE (amenity = 'retaurant' OR amenity = 'cafe' OR amenity = 'pub' OR amenity = 'fast_food')&line_filter=WHERE (railway IS NOT null AND bridge IS NOT null)"
      )
        .then((d) => d.json())
        .then((data) => {
          this.results = data;
        });
    },
  },
};
</script>

<style>
body {
  font-family: Helvetica, Arial, sans-serif;
}
</style>
