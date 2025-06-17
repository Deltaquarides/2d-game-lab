import { spriteConfigs } from "./spriteConfigs.js";
import { ImageHandler } from "../classes/imageHandler.js";

// preload all sprite images at the start of the game to avoid issues like trying
// to use a sprite before it's loaded or creating multiple ImageHandler instances for the same sprite.
//preloading + caching
//Loads images once, stores them in a shared cache, and exposes a getter.

//here we are creating new instance of ImageHandler to animate each sprite, in ImageHandler
// when calling the getter getSpriteHandler we get "Player.js:145 imgRenderer is not set!"
// because mageHandler loads each sprite image asynchronously (via a Promise inside createImage()).
//So it takes time before each image is fully loaded and ready to be drawn (i.e., handler.loaded = true)
//In preloadSprites(), we are: Creating ImageHandler instances, Storing them in the cache immediately,
//But each image inside those handlers might still be loading
//cause: we are not waiting for  handler.loaded to become true before continuing with the game
// solution:  wrap preloadSprites() in a Promise.all() (waiting for all handlers to report loaded === true)

const loadedSprites = {}; // Shared sprite cache

export function preloadSprites() {
  const promises = [];
  for (const [groupKey, groupValue] of Object.entries(spriteConfigs)) {
    for (const [spriteKey, config] of Object.entries(groupValue)) {
      // spriteConfigs contains src files, files, rows, colums...

      // here we attach a single ImageHandler instance to spriteConfig by assigning it to each config.handler,
      //later in eventListeners we assign that handler to player.imgRenderer.
      //This allows the Player class to use the animate() and draw() methods from ImageHandler during the game loop
      //in index.js, we call preloadSprites() befor calling making a new instance of Player.
      // loaded here reference to this.loaded in ImageHandler class

      const handler = new ImageHandler({
        // Create and assign a single ImageHandler for each sprite state.
        // This prevents reloading the same image multiple times.
        src: config.src,
        cols: config.totalCols, // pass totalCols as cols
        rows: config.totalRows, // pass totalRows as rows
        frameY: config.frameY,
        frameSpeed: config.frameSpeed || 7, // default if not set
        loopOnce: config.loopOnce || false, // default if not set
      });
      loadedSprites[spriteKey] = handler;

      console.log("laodedSprite", loadedSprites);
      const waitUntilLoaded = new Promise((resolve) => {
        const checkLoaded = () => {
          if (handler.loaded) {
            resolve(); // image is loaded, resolve this promise
          } else {
            requestAnimationFrame(checkLoaded); // check again on the next frame
          }
        };
        checkLoaded();
      });
      promises.push(waitUntilLoaded);
    }
  }
  return Promise.all(promises); // Return one promise that waits for ALL images to load
}

let previousHandler = null;

//getter function to access
export function getSpriteHandler(name) {
  const handler = loadedSprites[name];
  if (!handler) {
    console.log(`sprite not loaded ${name}`);
  }
  if (handler !== previousHandler) {
    console.log(`Returning new handler instance for ${name}`, handler);
    previousHandler = handler;
  } else {
    console.log(`Reusing handler instance for ${name}`, handler);
  }
  return handler;
}

//Usage in Game Objects
/*
import { getSpriteHandler } from "../engine/spriteLoader.js";
this.explosionSprite = getSpriteHandler("enemyExplode");


this.explosionSprite.animate(false);
this.explosionSprite.draw(ctx, x, y, width, height);
*/
