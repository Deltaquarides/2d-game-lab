import { createSpriteRenderer } from "../utils/global_utilities.js";

export class Items {
  constructor({
    ctx,
    itemsPotisions = { x: 0, y: 0 },
    player = null,
    onCollect = null,
  }) {
    this.position = {
      x: itemsPotisions.x,
      y: itemsPotisions.y,
    };
    this.width = 25;
    this.height = 25;

    this.hitbox = {
      position: {
        x: this.position.x + 5,
        y: this.position.y + 2,
      },
      width: 17,
      height: 20,
    };

    this.ctx = ctx;
    this.ringSprite = createSpriteRenderer("items", "ring");
    this.coinExplode = createSpriteRenderer("items", "ringExplosion");
    console.log(this.coinExplode);

    this.player = player;

    this.isCollected = false;

    this.onCollect = onCollect;

    this.markedForDeletion = false;
  }

  collect() {
    this.isCollected = true;
  }

  checkCollisionWithPlayer() {
    if (!this.player) return; // In case player not yet assigned

    const playerHead = this.player.hitbox.position.y;
    const playerFeet =
      this.player.hitbox.position.y + this.player.hitbox.height;
    const playerRight =
      this.player.hitbox.position.x + this.player.hitbox.width;
    const playerLeft = this.player.hitbox.position.x;

    const ringTop = this.hitbox.position.y;
    const ringBottom = this.hitbox.position.y + this.hitbox.height;
    const ringRight = this.hitbox.position.x + this.hitbox.width;
    const ringLeft = this.hitbox.position.x;

    const isColliding =
      playerHead < ringBottom &&
      playerFeet > ringTop &&
      playerRight > ringLeft &&
      playerLeft < ringRight;

    if (isColliding && !this.isCollected) {
      //     console.log(
      //     `%c[COLLECTED] Ring at (${this.position.x}, ${this.position.y})`,
      //    "color: gold; font-weight: bold;"
      //   );
      this.collect();

      if (this.onCollect) {
        this.onCollect(); // Increment shared counter!
      }
    }
  }

  debugItems() {
    this.ctx.strokeStyle = "green";
    this.ctx.strokeRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(
      this.hitbox.position.x,
      this.hitbox.position.y,
      this.hitbox.width,
      this.hitbox.height
    );
  }

  drawRing() {
    // normal ring
    if (this.ringSprite.loaded) {
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

  drawExplosion() {
    // explosion animation
    if (this.coinExplode.loaded) {
      this.coinExplode.animate();

      this.coinExplode.draw(this.ctx, this.position.x, this.position.y, 32, 32);

      if (this.coinExplode.frameX === this.coinExplode.cols - 1) {
        this.markedForDeletion = true;
      }
    }
  }
  draw() {
    if (!this.isCollected) {
      this.drawRing();
    } else {
      this.drawExplosion();

      // maybe add logic: after explosion finishes, mark for deletion
    }
  }
  update() {
    this.checkCollisionWithPlayer();
    this.draw();
    this.debugItems();
  }
}
