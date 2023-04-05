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
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "FeatureView",
  props: {
    query: Object,
    index: Number,
  },
  methods: {
    remove(index) {
      this.$store.commit("removeSelected", index);
    },
  },
};
</script>

<style>
.super {
  font-size: 0.8em;
  vertical-align: super;
  text-decoration: none;
}
</style>
