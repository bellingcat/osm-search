<template>
  <v-row>
    <v-col>
      <v-card
        @drop="onDrop"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        :color="accepting ? '#ddd' : ''"
        style="min-height: 100%"
      >
        <v-card-title>Selected features</v-card-title>
        <v-card-text>
          <v-col v-if="store.selected.length > 0">
            <FeatureView
              v-for="(query, i) in store.selected"
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
              v-for="query in store.presets"
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
          <div v-if="store.customPresets.length > 0">
            <span class="custom-header">Custom presets</span>
            <v-chip
              v-for="query in store.customPresets"
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

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { ref } from "vue";

const store = useAppStore();
const accepting = ref(false);
const deleteDialog = ref(false);

function onDrop(e) {
  accepting.value = false;
  let data = JSON.parse(e.dataTransfer.getData("object"));
  store.updateSelected([...store.selected, data]);
}
function addFeature(f) {
  store.updateSelected([...store.selected, f]);
}
function onDragOver(e) {
  accepting.value = true;
  e.preventDefault();
}
function onDragLeave() {
  accepting.value = false;
}
function startDrag(e, item) {
  e.dataTransfer.setData("object", JSON.stringify(item));
}
function removePreset(f) {
  store.removePreset(f.id);
}
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
