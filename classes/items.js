import { createSpriteRenderer } from "../utils/global_utilities";

export class Items {
  constructor({ x, y }) {
    this.position = {
      x: x,
      y: y,
      itemType,
    };
    this.width = 32;
    this.height = 32;
    this.itemType = itemType;
    this.ringSprite = createSpriteRenderer("items", "ring");
  }
}
