import { createSpriteRenderer } from "../utils/global_utilities.js";

export class Items {
  constructor({ ctx, itemsPotisions = { x: 0, y: 0 } }) {
    this.position = {
      x: itemsPotisions.x,
      y: itemsPotisions.y,
    };
    this.ctx = ctx;
    this.width = 64;
    this.height = 64;
    this.ringSprite = createSpriteRenderer("items", "ring");
    console.log("this.ringSprite", this.ringSprite);
  }

  draw() {
    if (this.ringSprite && this.ringSprite.loaded) {
      this.ringSprite.animate();
      this.ringSprite.draw(
        this.ctx,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
  }
  update() {
    this.draw();
  }
}
