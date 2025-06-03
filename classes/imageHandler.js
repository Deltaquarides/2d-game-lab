import { createImage } from "../utils/createImage.js";

//animate all sprite
export class ImageHandler {
  constructor({ src, cols, rows, frameY, frameSpeed = 7, loopOnce = false }) {
    // Will be calculated when image loads
    this.spriteWidth = 0;
    this.spriteHeight = 0;

    // Sprite crop settings
    this.src = src;
    this.cols = cols;
    this.rows = rows;
    this.frameY = frameY; // ← second row (0-indexed)
    this.frameSpeed = frameSpeed; // Controls how fast the frames change (higher = slower)
    this.loopOnce = loopOnce;

    this.frameX = 0;
    this.frameTimer = 0; // Keeps track of time for switching frames

    this.loaded = false; // custom flag confirming the image finished loading

    this.loopOnce = loopOnce; //  controls if animation should only play once
    this.playedOnce = false; //  flag to track if it already played

    // handling the promise: onload the image
    createImage(this.src)
      .then((image) => {
        this.image = image; //store the loaded image
        this.spriteWidth = this.image.width / this.cols; // Calculate sprite width
        this.spriteHeight = this.image.height / this.rows; // Calculate sprite height
        this.loaded = true; //  set when ready
      })
      .catch((error) => {
        if (!this.src) {
          console.log(this.src);
        }
        console.error("Image failed to load", error, this.image);
      }); // Handle image load error
  }

  // !!!!!!  i keep "get src()" just in case if i need the source in another file but not usefull here//
  //get src() {
  //return this.image?.src;
  //}

  //draw method visually render the player on the canvas,
  //by it's color and drawing a rectancle by it's positions: x,y and shape: width (how wide), height(how tall)
  draw(ctx, x, y, width, height) {
    if (this.image && this.loaded) {
      // if image exist and has been fully loaded and the custom flag is true draw the image
      // draw the image if image
      const sx = this.frameX * this.spriteWidth;
      const sy = this.frameY * this.spriteHeight;

      ctx.drawImage(
        this.image, // image source
        sx,
        sy, // source x and y (cropping start)
        this.spriteWidth, // source width
        this.spriteHeight, // source height
        x, // destination x
        y, // destination y
        width, // scaled width on canvas
        height // scaled height on canvas
      );
    } else {
      // fallback: draw a red box
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(x, y, width, height);
    }
  }

  // Animation method: Controls the frame switching
  //in other terms its animation frames

  animate() {
    if (!this.loaded || (this.loopOnce && this.playedOnce)) return; // don't animate until ready

    this.frameTimer++; // Increment frame timer

    // If the frame timer reaches the frameSpeed, switch to the next frame
    if (this.frameTimer >= this.frameSpeed) {
      this.frameTimer = 0; // Reset frame timer

      if (this.frameX < this.cols - 1) {
        //if end of the sprite
        this.frameX++; // Move to the next frame in the sprite sheet
      } else {
        if (this.loopOnce) {
          this.playedOnce = true; // Stop animating
        } else {
          // If we're at the last frame, go back to the first one
          this.frameX = 0;
        }
      }
    }
  }
}
