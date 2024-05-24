<template>
  <v-list-item variant="outlined" class="mb-1" rounded :prepend-icon="icon">
    <template v-slot:title>
      <v-list-item-title :style="`color: ${color}`">
        <v-row class="ma-0 align-center">
          <v-text-field v-model="localName" @update:focused="updateName" hide-details variant="underlined"
            density="compact" style="max-width: 70%"></v-text-field>
          <span class="type">({{ query.type }})</span>
        </v-row>
      </v-list-item-title>
      <div v-for="(f, i) in query.filters" :key="i">
        <div class="code">
          <v-row class="ma-0 align-center">
            {{ (i == 0 ? "" : query.method + " ") + f.parameter
            }}<a :href="'https://wiki.openstreetmap.org/wiki/Key:' + f.parameter" target="_blank">
              <v-icon size="x-small">mdi-open-in-new</v-icon></a>
            {{ f.comparison }}
            {{
            f.comparison == "is null" || f.comparison == "is not null"
            ? ""
            : f.value
            }}
          </v-row>
        </div>
      </div>
    </template>
    <template v-slot:append>
      <v-row class="ma-0 align-center" style="height: 100%">
        <v-btn v-if="query.unsavedCustomFeature" @click.stop="saveCustomDialog = true" variant="text" color="blue"
          icon="mdi-content-save"></v-btn>
        <v-btn @click.stop="remove(index)" variant="text" color="red" icon="mdi-delete"></v-btn>
      </v-row>
    </template>
    <v-dialog v-model="saveCustomDialog" width="auto">
      <v-card>
        <v-card-title>Save this feature as a preset</v-card-title>
        <v-card-text>
          Your saved presets are only visible to you.
          <v-text-field label="Preset name" required v-model="localName" @update:focused="updateName"
          :error="error"></v-text-field>
        </v-card-text>
        <v-card-actions style="padding-bottom: 1em; margin-top: -0.5em">
          <v-btn color="red" @click="
              saveCustomDialog = false;
              error = false;
            ">Cancel</v-btn>
          <v-btn color="primary" style="margin-right: 0em; margin-left: auto" @click="tryToSave(index)">Save
            preset</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-list-item>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { watch, ref, computed } from "vue";
const props = defineProps(["query", "index"]);

const store = useAppStore();
const saveCustomDialog = ref(false);
const newName = ref("");
const error = ref(false);
const localName = ref(props.query.name);

const name = computed(() => {
  return props.query.name;
});

const color = computed(() => {
  switch (props.query.type) {
    case "point":
      return "#8BC34A";
    case "line":
      return "#46d4db";
    case "polygon":
      return "#FFC107";
    default:
      return "#BEBEBE";
  }
});
const icon = computed(() => {
  switch (props.query.type) {
    case "point":
      return "mdi-map-marker";
    case "line":
      return "mdi-map-marker-path";
    case "polygon":
      return "mdi-map-marker-radius";
    default:
      return "mdi-map-marker-question";
  }
});

function remove(index) {
  store.removeSelected(index);
}
function tryToSave(index) {
  if (name.value.length == 0) {
    error.value = true;
    return;
  }

  let oldSelected = store.selected;
  oldSelected[index].unsavedCustomFeature = false;
  oldSelected[index].name = name;
  store.updateSelected(oldSelected);
  saveCustomDialog.value = false;
  store.savePreset({ index, name: name.value });
}

function updateName(focus) {
  if (!focus) {
    console.log("Updaing")
    store.renameFeature(props.index, localName.value);
  }
}

watch(name, (newName) => {
  localName.value = newName;
});

watch(newName, (newName) => {
  if (newName.length > 0) {
    error.value = false;
  }
});
</script>

<style>
</style>
