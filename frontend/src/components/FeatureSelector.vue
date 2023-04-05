<template>
  <v-row>
    <v-col>
      <v-card
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        :color="accepting ? '#ddd' : '#fff'"
        style="min-height: 100%"
      >
        <v-card-title>Selected features</v-card-title>
        <v-card-text>
          <v-col v-if="$store.state.selected.length > 0">
            <FeatureView
              v-for="(query, i) in $store.state.selected"
              :key="query.name + query.type"
              :query="query"
              :index="i"
            />
          </v-col>
          <v-col v-else>
            <v-alert type="info">
              Drag and drop feature presets here to add them to the selection.
            </v-alert>
          </v-col>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card>
        <v-card-title>Feature presets</v-card-title>
        <v-card-text>
          <v-chip
            v-for="query in queries"
            :key="query.name + query.type"
            :color="
              query.type == 'point'
                ? '#8BC34A'
                : query.type == 'line'
                ? '#46d4db'
                : query.type == 'polygon'
                ? '#FFC107'
                : '#BEBEBE'
            "
            draggable
            @dragstart="startDrag($event, query)"
            style="margin: 0.25em"
            @click="addFeature(query)"
            >{{ query.name }}</v-chip
          >
        </v-card-text>
      </v-card>
      <FeatureCustom />
    </v-col>
  </v-row>
</template>

<script>
import queries from "./queries.js";
import FeatureView from "./FeatureView.vue";
import FeatureCustom from "./FeatureCustom.vue";

export default {
  name: "FeatureSelector",
  components: {
    FeatureView,
    FeatureCustom,
  },
  data() {
    return {
      queries,
      accepting: false,
    };
  },
  methods: {
    onDrop(e) {
      this.accepting = false;
      let data = JSON.parse(e.dataTransfer.getData("object"));
      this.$store.commit("updateSelected", [
        ...this.$store.state.selected,
        data,
      ]);
    },
    addFeature(f) {
      this.$store.commit("updateSelected", [...this.$store.state.selected, f]);
    },
    onDragOver(e) {
      this.accepting = true;
      e.preventDefault();
    },
    onDragLeave() {
      this.accepting = false;
    },
    startDrag(e, item) {
      e.dataTransfer.setData("object", JSON.stringify(item));
    },
  },
};
</script>

<style>
.code {
  font-family: Consolas, "Roboto Mono", Courier, monospace;
}

.type {
  font-style: italic;
}
</style>
