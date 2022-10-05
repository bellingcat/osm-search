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
          <v-col>
            <v-card
              v-for="(query, i) in $store.state.selected"
              :key="query.name + query.type"
              close
              style="margin-bottom: 1em"
            >
              <v-card-title
                :color="
                  query.type == 'point'
                    ? '#8BC34A'
                    : query.type == 'line'
                    ? '#00BCD4'
                    : '#FFC107'
                "
              >
                {{ query.name }}&nbsp;
                <span class="type">({{ query.type }})</span>
              </v-card-title>
              <v-card-text>
                <span class="code">
                  {{ query.filter }}
                </span>
              </v-card-text>
              <v-card-actions>
                <v-btn color="red" text @click="remove(i)"> Remove </v-btn>
              </v-card-actions>
            </v-card>
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
                ? '#00BCD4'
                : '#FFC107'
            "
            draggable
            @dragstart="startDrag($event, query)"
            style="margin: 0.25em"
            @click="addFeature(query)"
            >{{ query.name }}</v-chip
          >
        </v-card-text>
      </v-card>
      <v-card style="margin-top: 1em">
        <v-card-title>Custom feature</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="3"
              ><v-select
                label="Feature type"
                :items="queryTypes"
                v-model="selectedQueryType"
              ></v-select> </v-col
            ><v-col>
              <v-text-field
                class="code"
                label="Filter statement"
                v-model="customFilter"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="addCustom">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import queries from "./queries.js";

export default {
  name: "FeatureSelector",
  data() {
    return {
      queries,
      queryTypes: ["point", "line", "polygon"],
      selectedQueryType: "point",
      customFilter: "",
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
    remove(index) {
      let value = this.$store.state.selected;
      let newValue = [
        ...value.slice(0, index),
        ...value.slice(index + 1, value.length),
      ];
      console.log(index, value, newValue);
      this.$store.commit("updateSelected", newValue);
    },
    addCustom() {
      this.$store.commit("updateSelected", [
        ...this.$store.state.selected,
        {
          name: "Custom filter",
          type: this.selectedQueryType,
          filter: this.customFilter,
        },
      ]);

      this.customFilter = "";
      this.selectedQueryType = "point";
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
