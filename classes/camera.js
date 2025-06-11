// Implement scrolling functionality.
// create blocks,(scrollPostRight,scrollPostTop) to scrolll the scene in the x and y axis.
export class Camera {
  constructor({ ctx, player }) {
    this.x = 0;
    this.y = 0;
    this.scrollPostRight = 350;
    this.scrollPostTop = 100;
    this.scrollPostBottom = 210;
    this.ctx = ctx;
    this.player = player;
  }

  update() {
    const playerX = this.player.position.x;
    const playerY = this.player.position.y;
    //scroll the scene only if player pass the scrollPostRight
    if (playerX > this.scrollPostRight) {
      this.x = playerX - this.scrollPostRight; //distance between the player and scrollPostRight
    }
    if (playerY < this.scrollPostTop) {
      this.y = this.scrollPostTop - playerY; //distance between the player and scrollPostRight
    } else if (playerY > this.scrollPostBottom) {
      this.y = this.scrollPostBottom - playerY; //distance between the player and scrollPostRight
    } else {
      this.y = 0;
    }
  }

  applyTransform() {
    this.ctx.translate(-this.x, this.y);
  }

  drawDebug() {
    this.ctx.save();
    this.ctx.fillStyle = "orange";
    this.ctx.fillRect(this.scrollPostRight, 100, 10, 64);
    this.ctx.fillStyle = "orange";
    this.ctx.fillRect(100, this.scrollPostTop, 64, 10);
    this.ctx.fillStyle = "orange";
    this.ctx.fillRect(100, this.scrollPostBottom, 64, 10);
    this.ctx.restore();
  }
}
