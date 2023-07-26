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
            :search-input.sync="f.parameter"
            :items="$store.state.osmKeys"
            @input="getValues"
          >
            <template
              v-slot:append
              v-if="f.parameter != '' && f.parameter != null"
            >
              <a
                :href="'https://wiki.openstreetmap.org/wiki/Key:' + f.parameter"
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
            v-model="f.comparison"
          ></v-select>
        </v-col>
        <v-col>
          <!-- Text field for parameter value -->
          <v-combobox
            class="code"
            label="OSM value"
            :search-input.sync="f.value"
            :items="$store.state.selectedKeyValues"
            :disabled="
              f.comparison == 'is null' || f.comparison == 'is not null'
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

<script>
export default {
  name: "FeatureCustom",
  data() {
    return {
      queryTypes: ["any", "point", "line", "polygon"],
      selectedQueryType: "any",
      method: "OR",
      filters: [
        {
          parameter: "",
          comparison: "=",
          value: "",
        },
      ],
    };
  },
  methods: {
    addCustom() {
      this.$store.commit("updateSelected", [
        ...this.$store.state.selected,
        {
          name: "Custom filter",
          type: this.selectedQueryType,
          filters: this.filters.filter((v) => v.parameter != ""),
          method: this.method,
          unsavedCustomFeature: true,
        },
      ]);

      this.method = "OR";
      this.filters = [
        {
          parameter: "",
          comparison: "=",
          value: "",
        },
      ];
      this.selectedQueryType = "any";
    },
    addFilter() {
      this.filters.push({
        parameter: "",
        comparison: "=",
        value: "",
      });
    },
    getValues(v) {
      this.$store.dispatch("getValues", v);
    },
  },
};
</script>
