<template>
  <v-card style="margin-top: 1em">
    <v-card-title>Custom feature</v-card-title>
    <v-card-text>
      <v-row v-for="(f, i) in filters" :key="'row' + i">
        <v-col cols="3"
          ><v-select
            v-if="i == 0"
            label="Feature type"
            :items="queryTypes"
            v-model="selectedQueryType"
          ></v-select>
          <v-select
            v-else-if="i == 1"
            label="Condition"
            :items="['OR', 'AND']"
            v-model="method"
          ></v-select> </v-col
        ><v-col>
          <!-- Text field for OSM parameter -->
          <v-combobox
            class="code"
            label="OSM key"
            v-model="filters[i].parameter"
            :items="store.osmKeys"
            @update:modelValue="getValues"
          >
            <template
              v-slot:append
              v-if="filters[i].parameter != '' && filters[i].parameter != null"
            >
              <a
                :href="
                  'https://wiki.openstreetmap.org/wiki/Key:' +
                  filters[i].parameter
                "
                target="_blank"
                class="super"
              >
                <v-icon x-small>mdi-open-in-new</v-icon></a
              >
            </template>
          </v-combobox></v-col
        >
        <v-col>
          <!-- Dropdown for type of comparison between parameter and value -->
          <v-select
            label=""
            :items="[
              '=',
              '!=',
              '>',
              '<',
              '>=',
              '<=',
              'starts with',
              'ends with',
              'contains',
              'does not contain',
              'is null',
              'is not null',
            ]"
            v-model="filters[i].comparison"
          ></v-select>
        </v-col>
        <v-col>
          <!-- Text field for parameter value -->
          <v-combobox
            class="code"
            label="OSM value"
            v-model="filters[i].value"
            :items="store.selectedKeyValues"
            :disabled="
              filters[i].comparison == 'is null' ||
              filters[i].comparison == 'is not null'
            "
          ></v-combobox>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn color="secondary" text @click="addFilter">Add condition</v-btn>
      <v-btn
        style="margin-left: auto"
        color="primary"
        text
        @click="addCustom"
        :disabled="filters[0].parameter == ''"
        >Add custom feature</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useAppStore } from "@/stores/app";
import { file } from "@babel/types";
import { featureGroupProps } from "@vue-leaflet/vue-leaflet/dist/src/functions/featureGroup";
import { ref, reactive } from "vue";

const store = useAppStore();
const queryTypes = ["any", "point", "line", "polygon"];
const selectedQueryType = ref("any");
const method = ref("OR");
const filters = ref([
  {
    parameter: "",
    comparison: "=",
    value: "",
  },
]);

function addCustom() {
  store.updateSelected([
    ...store.selected,
    {
      name: "Custom filter",
      type: selectedQueryType.value,
      filters: filters.value.filter((v) => v.parameter != ""),
      method: method.value,
      unsavedCustomFeature: true,
    },
  ]);

  method.value = "OR";
  filters.value = [
    {
      parameter: "",
      comparison: "=",
      value: "",
    },
  ];
  selectedQueryType.value = "any";
}
function addFilter() {
  filters.value.push({
    parameter: "",
    comparison: "=",
    value: "",
  });
}
function getValues(v) {
  store.getValues(v);
}
</script>
