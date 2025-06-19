import { createImage } from "../utils/createImage.js";

export class Heart {
  constructor({ x, y, width, height, imageSrc }) {
    this.position = {
      x: x,
      y: y,
    };
    this.width = width;
    this.height = height;

    this.cropBox = {
      x: 0,
      y: 0,
      width: 21,
      height: 18,
    };

    //load heart image
    createImage(imageSrc)
      .then((image) => {
        this.image = image;
        this.ready = true;
      })
      .catch((error) => console.error("Hearts sprite failed to load", error));

    // this.markedForDeletion = false;
  }

  //markForDeletion() {
  // this.markedForDeletion = true;
  //}

  drawUI(ctx, offsetX = 0) {
    if (!this.ready) return;
    // if (!this.markedForDeletion) {
    this.draw(ctx, offsetX);
    //}
  }

  draw(ctx, offsetX) {
    ctx.drawImage(
      this.image,
      this.cropBox.x,
      this.cropBox.y,
      this.cropBox.width,
      this.cropBox.height,
      this.position.x + offsetX,
      this.position.y,

      this.width,
      this.height
    );
  }
}
