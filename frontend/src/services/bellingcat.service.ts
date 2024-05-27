const PAGE_SIZE = 100;
const OSM_SEARCH_API = "http://localhost:5050"; //"https://api.osm-search.bellingcat.com";

class BellingCatService {
  token: string | null;
  lastRequest: string | null;
  cache: Map<string, Promise<any>>;

  constructor() {
    this.token = null;
    this.lastRequest = null;
    this.cache = new Map();
  }

  setToken(token) {
    this.token = token;
  }

  search({ bbox, range, filters, page = 0, prefetchNext = false }) {
    // Check cache based on parameters and page
    const requestKey = `${bbox[0][1]}_${bbox[0][0]}_${bbox[1][1]}_${bbox[1][0]}_${range}_${filters}`;
    const cacheKey = `${requestKey}_${page}`;

    if (this.lastRequest && this.lastRequest != requestKey) {
      this.cache.clear();
    }
    this.lastRequest = requestKey;

    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      if (prefetchNext) {
        setTimeout(() => {
          this.search({ bbox, range, filters, page: page + 1 });
        }, 1000);
      }
      return Promise.resolve(cachedData);
    }

    const result = new Promise((resolve, reject) => {
      const time1 = performance.now();

      fetch(
        `${OSM_SEARCH_API}/intersection?l=${bbox[0][1]}&b=${bbox[0][0]}&r=${bbox[1][1]}&t=${bbox[1][0]}&buffer=${Math.round(range)}&filters=${filters}&limit=${PAGE_SIZE}&page=${page}`,
        {
          headers: {
            Authorization: "Bearer " + this.token,
          },
        },
      )
        .then((d) => {
          if (d.status != 200) {
            return Promise.reject(Error(`${d.status}`));
          }
          return d.json();
        })
        .then(({ data, has_more }) => {
          const time2 = performance.now();
          const responseTime = time2 - time1;
          const response = {
            responseTime,
            data: data.map((item, index) => ({
              ...item,
              index: index + page * PAGE_SIZE,
            })),
            hasMore: has_more,
          };
          if (has_more && prefetchNext) {
            setTimeout(() => {
              this.search({ bbox, range, filters, page: page + 1 });
            }, 1000);
          }
          resolve(response);
        })
        .catch((e) => {
          switch (e.message) {
            case "400":
              reject(
                "Your search area is too large, or your search timed out. Zoom in on a smaller area or change your search parameters.",
              );
              break;
            case "401":
              reject("The data provided was invalid.");
              break;
            case "403":
              reject("Your login has expired. Please log in again.");
              break;
            case "408":
              reject("The request timed out.");
              break;
            case "500":
              reject("The server encountered an error.");
              break;
            default:
              reject(
                "Search error. Check your custom features or email logan@bellingcat.com.",
              );
          }
        });
    });

    this.cache.set(cacheKey, result);
    return result;
  }
}

export const bellingCatService = new BellingCatService();
