<template>
  <v-col class="pa-0 ma-0">
    <v-card variant="plain">
      <v-card-title>Selected features</v-card-title>
      <v-card @drop="onDrop" @dragover="onDragOver" @dragleave="onDragLeave" :color="accepting ? '#ddd' : ''"
        style="min-height: 100%" class="ma-4" variant="flat">
        <v-card-text>
          <v-col v-if="store.selected.length > 0">
            <FeatureView v-for="(query, i) in store.selected" :key="query.name + query.type" :query="query"
              :index="i" />
          </v-col>
          <v-col v-else class="justify-center text-center">
            <v-icon size="x-large">mdi-import</v-icon><br/>
                Drag and drop feature presets here to add them to the selection.<br />
                Clicking on them will also add them.
          </v-col>
        </v-card-text>
      </v-card>
    </v-card>

    <v-card variant="flat">
      <v-card-title>Feature presets</v-card-title>
      <v-card-text>
        <div>
          <v-chip v-for="query in store.presets" :key="query.name + query.type" :color="
              query.type == 'point'
                ? '#8BC34A'
                : query.type == 'line'
                  ? '#46d4db'
                  : query.type == 'polygon'
                    ? '#FFC107'
                    : '#BEBEBE'
            " prepend-icon="mdi-plus" draggable @dragstart="startDrag($event, query)" style="margin: 0.25em"
            @click="addFeature(query)">{{ query.name }}</v-chip>
        </div>
      </v-card-text>
      <div v-if="store.customPresets.length > 0">
        <v-card-title>Custom presets</v-card-title>
        <v-card-text>
          <v-chip v-for="query in store.customPresets" :key="query.id" :color="
              query.type == 'point'
                ? '#8BC34A'
                : query.type == 'line'
                  ? '#46d4db'
                  : query.type == 'polygon'
                    ? '#FFC107'
                    : '#BEBEBE'
            " draggable prepend-icon="mdi-plus" @dragstart="startDrag($event, query)" style="margin: 0.25em"
            @click="addFeature(query)">
            <template #close>
              <v-icon icon="mdi-close-circle" @click.stop="customPresetToDelete = query" />
            </template>
            {{ query.name }}</v-chip>
        </v-card-text>
      </div>
      <v-dialog v-model="isDeleteDialogShown" width="auto">
        <v-card v-if="isDeleteDialogShown">
          <v-card-title>Delete custom preset</v-card-title>
          <v-card-text>
            Are you sure you want to delete the custom preset "{{
            customPresetToDelete.name
            }}" from your account?
          </v-card-text>
          <v-card-actions style="padding-bottom: 1em; margin-top: -0.5em">
            <v-btn color="red" @click="removePreset(customPresetToDelete.id)">Delete</v-btn>

            <v-btn color="primary" style="margin-right: 0em; margin-left: auto"
              @click="isDeleteDialogShown = false">Keep preset</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
    <FeatureCustom />
  </v-col>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { computed, ref } from "vue";

const store = useAppStore();
const accepting = ref(false);

const customPresetToDelete = ref(null);
const isDeleteDialogShown = computed({
  get: () => {
    return customPresetToDelete.value != null;
  },
  set: (val) => {
    if (val) {
      return;
    }

    customPresetToDelete.value = null;
  },
});

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
  store.removePreset(f);
  isDeleteDialogShown.value = false;
}
</script>

<style>
.code {
  font-family: Consolas, "Roboto Mono", Courier, monospace;
}

.type {
  font-style: italic;
}
</style>
