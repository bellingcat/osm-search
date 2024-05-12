<template>
  <v-card close style="margin-bottom: 1em">
    <v-card-title>
      {{ query.name }}&nbsp;
      <span class="type">({{ query.type }})</span>
    </v-card-title>
    <v-card-text>
      <div v-for="(f, i) in query.filters" :key="i">
        <div class="code">
          {{ (i == 0 ? "" : query.method + " ") + f.parameter
          }}<a
            :href="'https://wiki.openstreetmap.org/wiki/Key:' + f.parameter"
            target="_blank"
            class="super"
          >
            <v-icon x-small>mdi-open-in-new</v-icon></a
          >
          {{ f.comparison }}
          {{
            f.comparison == "is null" || f.comparison == "is not null"
              ? ""
              : f.value
          }}
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn color="red" text @click="remove(index)"> Remove </v-btn>
      <v-btn
        color="blue"
        v-if="query.unsavedCustomFeature"
        text
        @click="dialog = true"
      >
        Save feature preset
      </v-btn>
    </v-card-actions>
    <v-dialog v-model="dialog" activator="parent" width="auto">
      <v-card>
        <v-card-title>Save this feature as a preset</v-card-title>
        <v-card-text>
          Your saved presets are only visible to you.
          <v-text-field
            label="Preset name"
            required
            v-model="name"
            :error="error"
          ></v-text-field>
        </v-card-text>
        <v-card-actions style="padding-bottom: 1em; margin-top: -0.5em">
          <v-btn
            color="red"
            @click="
              dialog = false;
              error = false;
            "
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            style="margin-right: 0em; margin-left: auto"
            @click="tryToSave(index)"
            >Save preset</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { watch, ref } from "vue";
defineProps(["query", "index"]);

const store = useAppStore();
const dialog = ref(false);
const name = ref("");
const error = ref(false);

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
  dialog.value = false;
  store.savePreset({ index, name: name });
}

watch(name, (newName) => {
  if (newName.length > 0) {
    error.value = false;
  }
});
</script>

<style>
.super {
  font-size: 0.8em;
  vertical-align: super;
  text-decoration: none;
}
</style>
