import { getSpriteHandler } from "../utils/preloadSprites.js";

export class Projectile {
  constructor({ x, y, speed, facing = "right", spriteKey = "spit" }) {
    (this.x = x), (this.y = y), (this.width = 32), (this.height = 32);
    this.speed = facing === "right" ? Math.abs(speed) : -Math.abs(speed);
    this.renderer = getSpriteHandler(spriteKey);
  }

  update() {
    this.x += this.speed;
    if (this.renderer) this.renderer.animate();
  }

  draw(ctx) {
    if (this.renderer && this.renderer.loaded) {
      this.renderer.draw(ctx, this.x, this.y, this.width, this.height);
    }
  }
}
