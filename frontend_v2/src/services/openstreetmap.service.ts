class OsmService {
  getKeys() {
    return fetch(
      "https://taginfo.openstreetmap.org/api/4/keys/all?page=1&rp=200&filter=in_wiki&sortname=count_all&sortorder=desc",
    ).then((d) => {
      if (d.status != 200) {
        return Promise.reject(Error(`${d.status}`));
      }
      return d.json();
    });
  }

  getValues(v) {
    return fetch(
      "https://taginfo.openstreetmap.org/api/4/key/values?rp=50&sortname=count_all&sortorder=desc&page=1&key=" +
        v,
    ).then((d) => {
      if (d.status != 200) {
        return Promise.reject(Error(`${d.status}`));
      }
      return d.json();
    });
  }
}

export const osmService = new OsmService();
