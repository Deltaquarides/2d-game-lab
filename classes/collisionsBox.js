//handle visual rendering of blocks and platforms
//use rgba to add opacity for debuging
export class CollisionsBox {
  constructor({ position, width, height }) {
    this.position = position;
    this.width = width;
    this.height = height;
  }
  draw(ctx) {
    ctx.fillStyle = "rgba(255, 0, 0, 0)";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}
