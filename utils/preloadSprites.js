import { spriteConfigs } from "./spriteConfigs.js";
import { ImageHandler } from "../classes/imageHandler.js";

// preload all sprite images at the start of the game to avoid issues like trying
// to use a sprite before it's loaded or creating multiple ImageHandler instances for the same sprite.

export function preloadSprites() {
  for (const key in spriteConfigs) {
    // spriteConfigs contains src files, files, rows, colums...
    const config = spriteConfigs[key];

    // here we attach a single ImageHandler instance to spriteConfig by assigning it to each config.handler,
    //later in eventListeners we assign that handler to player.imgRenderer.
    //This allows the Player class to use the animate() and draw() methods from ImageHandler during the game loop
    //in index.js, we call preloadSprites() befor calling making a new instance of Player.

    config.handler = new ImageHandler( // Create and assign a single ImageHandler for each sprite state.
      // This prevents reloading the same image multiple times.
      config.src,
      config.cols,
      config.rows,
      config.frameY
    );
  }
}
