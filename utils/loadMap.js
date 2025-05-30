//function that load data; Layers, collisions ...
export function loadMap(url) {
  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `Failed to load ${url}: ${res.status} ${res.statusText}`
        );
      }
      return res.json();
    })
    .then((data) => data)
    .catch((err) => {
      console.log("error fetching data", err);
      throw err; // re-throw so the caller knows something went wrong
    });
}
