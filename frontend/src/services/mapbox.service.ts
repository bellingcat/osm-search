class MapBoxService {
  searchLocation(search_text) {
    return fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${search_text}.json?access_token=${import.meta.env.VITE_VUE_APP_MAPBOX_TOKEN}`,
    ).then((d) => {
      if (d.status != 200) {
        return Promise.reject(Error(`${d.status}`));
      }
      return d.json();
    });
  }
}

export const mapboxService = new MapBoxService();
