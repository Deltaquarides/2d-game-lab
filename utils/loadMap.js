//function that load data; Layers, collisions ...
export function loadMap(url) {
  return fetch(url)
    .then((res) => {
      if (!res) {
        console.log("no");
      }
      return res.json();
    })
    .then((data) => data)
    .catch((err) => console.log("error fetching data", err));
}
