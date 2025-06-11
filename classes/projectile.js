import { getSpriteHandler } from "../utils/preloadSprites.js";

export class Projectile {
  constructor({
    x,
    y,
    speed,
    facing = "right",
    spriteKey = "spit_right",
    collisionBlocks = [],
  }) {
    this.position = {
      x: x,
      y: y,
    };

    this.hitbox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 16,
      height: 16,
    };

    this.width = 32;
    this.height = 32;
    this.speed = facing === "right" ? Math.abs(speed) : -Math.abs(speed);
    this.renderer = getSpriteHandler(spriteKey);

    this.collisionBlocks = collisionBlocks;

    this.markedForDeletion = false;
    this.facing = facing;
  }

  //by default after 600ms projectile disapear
  startLifetime(duration = 800) {
    setTimeout(() => {
      this.markedForDeletion = true;
    }, duration);
  }

  checkCollisions() {
    for (let block of this.collisionBlocks) {
      if (
        this.hitbox.position.x < block.position.x + block.width &&
        this.hitbox.position.x + this.hitbox.width > block.position.x &&
        this.hitbox.position.y < block.position.y + block.height &&
        this.hitbox.position.y + this.hitbox.height > block.position.y
      ) {
        // this.markedForDeletion = true;
        console.log("touch down");
        this.speed = 0;

        const crashKey =
          this.facing === "right" ? "spit_crash_right" : "spit_crash_left";
        this.renderer = getSpriteHandler(crashKey);
      }
    }
  }

  //player give damages to enemy:
  // if enemy is luxmn 2 dmj, if amazon 3dmj, if otile 6 dmj

  //collision
  updateHitbox() {
    this.hitbox.position.x =
      this.position.x + (this.width - this.hitbox.width) / 2;
    this.hitbox.position.y =
      this.position.y + (this.height - this.hitbox.height) / 2;
  }

  update() {
    this.position.x += this.speed;
    this.updateHitbox();
    if (this.renderer) this.renderer.animate();
    this.checkCollisions();
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "red";
    ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

    ctx.strokeRect(
      this.hitbox.position.x,
      this.hitbox.position.y,
      this.hitbox.width,
      this.hitbox.height
    );

    if (this.renderer && this.renderer.loaded) {
      this.renderer.draw(
        ctx,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
    ctx.restore();
  }
}
