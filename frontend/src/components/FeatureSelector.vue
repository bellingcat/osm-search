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
          <div>
            <v-chip
              v-for="query in $store.state.presets"
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
          </div>
          <div v-if="$store.state.customPresets.length > 0">
            <span class="custom-header">Custom presets</span>
            <v-chip
              v-for="query in $store.state.customPresets"
              :key="query.id"
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
              close
              @click:close="deleteDialog = query"
              >{{ query.name }}</v-chip
            >
          </div>
          <v-dialog :value="deleteDialog" width="auto">
            <v-card>
              <v-card-title>Delete custom preset</v-card-title>
              <v-card-text>
                Are you sure you want to delete the custom preset "{{
                  deleteDialog.name
                }}" from your account?
              </v-card-text>
              <v-card-actions style="padding-bottom: 1em; margin-top: -0.5em">
                <v-btn
                  color="red"
                  @click="
                    removePreset(deleteDialog);
                    deleteDialog = false;
                  "
                  >Delete</v-btn
                >

                <v-btn
                  color="primary"
                  style="margin-right: 0em; margin-left: auto"
                  @click="deleteDialog = false"
                  >Keep preset</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-text>
      </v-card>
      <FeatureCustom />
    </v-col>
  </v-row>
</template>

<script>
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
      accepting: false,
      deleteDialog: false,
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
    removePreset(f) {
      this.$store.dispatch("removePreset", f.id);
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

.custom-header {
  font-weight: bold;
  color: black;
  margin-left: 0.5em;
  margin-right: 0.5em;
}
</style>
