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
            v-model="f.parameter"
            :items="$store.state.osmKeys"
            @input="getValues"
          ></v-combobox
        ></v-col>
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
            v-model="f.value"
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
      <v-btn style="margin-left: auto" color="primary" text @click="addCustom"
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
      queryTypes: ["point", "line", "polygon"],
      selectedQueryType: "point",
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
      this.selectedQueryType = "point";
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
