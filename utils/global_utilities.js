import { spriteConfigs } from "./spriteConfigs.js";
import { getSpriteHandler } from "./preloadSprites.js";
import { ImageHandler } from "../classes/imageHandler.js";

//global utilities

// ***cooldown timer for player, enemy, weapon. ex: to allow next hit by enemy***
export const coolDown = (object, property, valueAfterCooldown, duration) => {
  setTimeout(() => {
    object[property] = valueAfterCooldown;
  }, duration);
};

// to re-trigger the Animation, force a reflow by removing and re-adding the class:
// because in the next level introLvel won't show
//cause: animation class only triggers Once: CSS animations won't retrigger if the class is already applied
function resetAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth; // trigger reflow
  element.classList.add(className);
}

// **** for entrance level map add text and animation ****
export const introLevel = (levelName, levelNumber) => {
  if (!levelName && !levelNumber) {
    console.log(
      "no levelName and levelNumber reference",
      levelName,
      levelNumber
    );
  }

  const mapNameElement = document.querySelector(".mapName");
  const mapLevelElement = document.querySelector(".mapLevel");
  const ovalElement = document.querySelector(".oval");

  // check if the DOM element exist before
  if (mapNameElement && mapLevelElement && ovalElement) {
    mapNameElement.innerText = levelName;
    mapLevelElement.innerText = levelNumber;

    resetAnimation(mapNameElement, "mapName-animation");
    resetAnimation(mapLevelElement, "mapLevel-animation");
    resetAnimation(ovalElement, "oval-animation");
  } else {
    console.log("something went wrong Sherlock!");
  }
};

// ******Create and returns an ImageHandler using preload sprite data.****
//Ensure that eacch entity like an anemy or explosion gets its own ondependent animation.

/* What the function Does */
// Uses a shared preloaded image from getSpriteHandler to avoid reloading the image multiples times.
//Creates a new ImageHandler instance so each sprite(enemy, explosion, etc.)can animate independently- no shared frame state.
//  reusable for any sprite type(enemies explosions, etc.)

export const createSpriteRenderer = (spriteName, spriteKey) => {
  if (!spriteKey) {
    console.log("no sprite Key", spriteKey);
    return null;
  }

  const config = spriteConfigs[spriteName][spriteKey];

  if (!config) {
    console.log("No sprite config found for key", config);
    return null;
  }
  const baseHandler = getSpriteHandler(spriteKey); // dynamically retrieve the preloaded handler
  const spriteRenderer = new ImageHandler({
    src: config.src,
    cols: config.totalCols,
    rows: config.totalRows,
    frameY: config.frameY,
    frameSpeed: config.frameSpeed,
    loopOnce: config.loopOnce || false,
  });
  //console.log("this.enemyLuxmnRenderer", spriteRenderer);

  // Use the preloaded image from baseHandler
  if (baseHandler?.image) {
    spriteRenderer.image = baseHandler.image;
    spriteRenderer.loaded = true;
  } else {
    console.warn(
      "enemyLuxmn sprite handler not found or not loaded:",
      spriteKey
    );
  }
  return spriteRenderer;
};
