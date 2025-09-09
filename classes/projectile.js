import { getSpriteHandler } from "../utils/preloadSprites.js";
import { audioPlayer } from "../js/index.js";

export class Projectile {
  constructor({
    x,
    y,
    speed,
    facing = "right",
    spriteKey = "spit_right",
    collisionBlocks = [],
    mapBoundaries = null,
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

    this.startLifetime(); // default auto-destroy if nothing happens

    this.mapBoundaries = mapBoundaries;
  }

  //by default after 600ms projectile disapear
  startLifetime(duration = 600) {
    this._lifeTimer = setTimeout(() => {
      this.markedForDeletion = true;
    }, duration);
  }

  markForDeletion(delay = 300) {
    if (this._lifeTimer) clearTimeout(this._lifeTimer);
    setTimeout(() => (this.markedForDeletion = true), delay);
  }

  checkCollisionsBloc() {
    for (let block of this.collisionBlocks) {
      if (
        this.hitbox.position.x < block.position.x + block.width &&
        this.hitbox.position.x + this.hitbox.width > block.position.x &&
        this.hitbox.position.y < block.position.y + block.height &&
        this.hitbox.position.y + this.hitbox.height > block.position.y
      ) {
        if (!this.markedForDeletion) {
          this.speed = 0;

          const crashKey =
            this.facing === "right" ? "spit_crash_right" : "spit_crash_left";
          this.renderer = getSpriteHandler(crashKey);

          this.markForDeletion(300);
        }
        return true;
      }
    }
    return false;
  }

  //collision of projectile to boundaries of map
  checkCollisionsBoundaries() {
    if (!this.mapBoundaries) return;

    const collisionLeft = this.hitbox.position.x < this.mapBoundaries.leftEdge;
    const collisionRight =
      this.hitbox.position.x + this.hitbox.width > this.mapBoundaries.rightEdge;

    if (collisionLeft || collisionRight) {
      const crashKey =
        this.facing === "right" ? "spit_crash_right" : "spit_crash_left";
      this.renderer = getSpriteHandler(crashKey);
      this.speed = 0;
      return true; // <-- return true when collision happens
    }
    return false;
  }

  //player give damages to enemy:
  // if enemy is luxmn 2 dmj, if amazon 3dmj, if otile 6 dmj

  //collision
  updateHitbox() {
    this.hitbox.position.x =
      this.facing === "right"
        ? this.position.x
        : this.position.x + this.width - this.hitbox.width;
    this.hitbox.position.y =
      this.position.y + (this.height - this.hitbox.height) / 2;
  }

  update() {
    if (this.markedForDeletion) return;

    this.position.x += this.speed;
    this.updateHitbox();
    if (this.renderer) this.renderer.animate();
    this.checkCollisionsBloc();
    this.checkCollisionsBoundaries();
    if (this.checkCollisionsBloc() || this.checkCollisionsBoundaries())
      audioPlayer.playPartAudio({
        name: "plop",
        begin: 0.5,
        end: 1,
        volume: 0.6,
      });
  }

  draw(ctx) {
    ctx.save();
    //ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

    /*ctx.strokeStyle = "red";
    ctx.strokeRect(
      this.hitbox.position.x,
      this.hitbox.position.y,
      this.hitbox.width,
      this.hitbox.height
    );
    */

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
