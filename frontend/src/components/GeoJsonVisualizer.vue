<template>
  <l-polyline v-if="vizType === 'polyline'" :color="'#0000FF'" :lat-lngs="coordinates">
  </l-polyline>
  <l-polygon v-else-if="vizType === 'polygon'" :color="'#0000FF'" :fill="true" :fillOpacity="0.5" fillColor="#0000FF"
    :lat-lngs="coordinates">
  </l-polygon>
  <l-circle-marker v-else-if="vizType === 'marker'" :lat-lng="coordinates" :color="'#0000FF'" :radius="4">
  </l-circle-marker>
</template>

<script setup lang="ts">

import { GeoJSON } from '@/stores/app'
import { computed } from 'vue';
import { LPolygon, LPolyline, LCircleMarker } from '@vue-leaflet/vue-leaflet';

const props = defineProps<{
  geojson: GeoJSON
}>()

const vizType = computed(() => {
  switch (props.geojson.type) {
    case 'Point':
      return 'marker'
    case 'LineString':
      return 'polyline'
    case 'Polygon':
      return 'polygon'
    default:
      return 'polyline'
  }
})

const coordinates = computed(() => {
  if (props.geojson.type === 'Point') {
    return [props.geojson.coordinates[1], props.geojson.coordinates[0]]
  }

  if (props.geojson.type === 'LineString') {
    return props.geojson.coordinates.map(([lon,lat]) => [lat, lon])
  }

  if (props.geojson.type === 'Polygon') {
    return props.geojson.coordinates.map((i) => i.map(([lon, lat]) => [lat, lon]))
  }
})

</script>
