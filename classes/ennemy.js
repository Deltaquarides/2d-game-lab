/*
    - defined enemy postions width and height
    - defined enemy hitbox
    - draw an square for debug
    - add gravity
    - add collision for the enely to stay on ground
*/

export class Enemy {
  constructor(
    ctx,
    collisionBlocks = [],
    enemyPositions = { x: 0, y: 0 },
    player = null
  ) {
    this.player = player;
    this.position = {
      x: enemyPositions.x,
      y: enemyPositions.y,
    };
    this.width = 32;
    this.height = 32;

    this.hitbox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 25,
      height: 27,
    };

    this.gravity = 0.3;

    this.velocity = {
      x: 0,
      y: 0,
    };

    this.speed = 2; // patrol speed
    this.direction = 1; // 1 = right, -1 = left
    this.patrolrange = 50;
    this.minX = this.position.x - this.patrolrange;
    this.maxX = this.position.x + this.patrolrange;
    this.detectionRange = 70;
    this.activated = false;

    this.isOnGround = false; // ← track grounded state
    this.collisionBlocks = collisionBlocks;
    this.ctx = ctx;
  }

  update() {
    this.updateHitbox();
    this.applyGravity();
    this.checkOnGround();

    //in terms of performance and clarity, checking !this.activated is better avoiding
    if (!this.activated && this.isPlayerNearby()) {
      this.activated = true;
    }

    if (this.activated) {
      this.patrol();
    }
    this.draw();
  }

  updateHitbox() {
    this.hitbox.position.x =
      this.position.x + this.width / 2 - this.hitbox.width / 2; //middle vertically of render player
    this.hitbox.position.y = this.position.y + this.height - this.hitbox.height; //bottom horizontally of the render player
  }

  applyGravity() {
    if (!this.isOnGround) {
      this.velocity.y = this.velocity.y + this.gravity; // continue to fall
      // applying gravity if velocity is positif player move down, pulls down, if negatif player moves up, ex: a jump.
      this.position.y = this.position.y + this.velocity.y;
    }
  }

  checkOnGround() {
    // here we check x axis too because enemy was stuck in the top, why?
    //because of blocks elsewhere in the collision map — not directly
    // under the enemy — still matching the vertical-only collision check.
    const enemyFeet = this.position.y + this.height;
    let landed = false;

    for (const block of this.collisionBlocks) {
      const blockTop = block.position.y;
      const blockBottom = block.position.y + block.height;
      const blockLeft = block.position.x;
      const blockRight = block.position.x + block.width;
      const enemyLeft = this.position.x;
      const enemyRight = this.position.x + this.width;

      // Check if enemy is above and about to land on top
      const isHorizontallyAligned =
        enemyRight > blockLeft && enemyLeft < blockRight;
      const isFallingOntoBlock =
        this.velocity.y >= 0 &&
        enemyFeet <= blockTop &&
        enemyFeet + this.velocity.y >= blockTop;

      if (isHorizontallyAligned && isFallingOntoBlock) {
        this.velocity.y = 0;
        this.position.y = blockTop - this.height;
        landed = true; // just landed
        break; // stop checking more blocks
      }
    }

    this.isOnGround = landed;
  }

  isPlayerNearby() {
    const playerX = this.player.position.x;
    const distance = Math.abs(this.position.x - playerX); //Math.abs returns the absolute value of a number. here we want the number to stay positif
    return distance <= this.detectionRange;
  }
  patrol() {
    if (!this.isOnGround) return;
    //Move left or right
    this.position.x = this.position.x + this.speed * this.direction;

    if (
      this.position.x <= this.minX ||
      this.position.x + this.width >= this.maxX
    )
      this.direction *= -1;
  }

  draw() {
    //debug
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
    //debug hitbox
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(
      this.hitbox.position.x,
      this.hitbox.position.y,
      this.hitbox.width,
      this.hitbox.height
    );
  }
}
