//promises for img --> sprite image, platform image

export function createImage(src) {
  const image = new Image(); // create a new image
  image.src = src; // Set the source of the image
  return new Promise((resolve, reject) => {
    image.onload = () => {
      resolve(image);
    }; // Resolve promise once image is loaded
    image.onerror = (err) => {
      reject(err); // Reject promise if image fails to load
    };
  });
}
