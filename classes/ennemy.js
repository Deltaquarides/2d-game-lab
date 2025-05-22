import { spriteConfigs } from "../utils/spriteConfigs.js";
import { ImageHandler } from "./imageHandler.js";

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
    //player class
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

    this.speed = 1; // patrol speed
    this.direction = 1; // 1 = right, -1 = left
    this.patrolrange = 50;
    this.minX = this.position.x - this.patrolrange;
    this.maxX = this.position.x + this.patrolrange;
    this.detectionRange = 70;
    this.activated = false;

    //flags to remove enemy after explosion
    this.isDead = false;
    this.markedForDeletion = false;

    this.isOnGround = false; // ← track grounded state
    this.collisionBlocks = collisionBlocks;
    this.ctx = ctx;
  }

  update() {
    this.updateHitbox();
    this.applyGravity();

    //in terms of performance and clarity, checking !this.activated is better avoiding
    if (!this.activated && this.isPlayerNearby()) {
      this.activated = true;
    }

    if (this.activated && !this.isDead) {
      this.patrol();
      this.checkHorizontalCollisions();
    }

    this.checkOnGround();

    this.checkPlayerCollision(this.player, this); // this refer to the current enemy instance itself

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
    let landed = false;

    for (const block of this.collisionBlocks) {
      const blockTop = block.position.y;
      const blockLeft = block.position.x;
      const blockRight = block.position.x + block.width;

      const hitboxRight = this.hitbox.position.x + this.hitbox.width;
      const hitboxLeft = this.hitbox.position.x;
      const hitboxBottom = this.hitbox.position.y + this.hitbox.height;

      // Check collisions  vertically
      const isHorizontallyAligned =
        hitboxRight > blockLeft && hitboxLeft < blockRight;

      //check for vertical landing
      const isFallingOntoBlock =
        this.velocity.y >= 0 && //moving downward
        hitboxBottom <= blockTop && //above the block
        hitboxBottom + this.velocity.y >= blockTop;

      if (isHorizontallyAligned && isFallingOntoBlock) {
        this.velocity.y = 0;
        this.position.y = blockTop - this.height;
        landed = true; // just landed
        break; // stop checking more blocks
      }
    }

    this.isOnGround = landed;
  }

  checkHorizontalCollisions() {
    for (const block of this.collisionBlocks) {
      const blockTop = block.position.y;
      const blockBottom = block.position.y + block.height;
      const blockLeft = block.position.x;
      const blockRight = block.position.x + block.width;

      const hitboxTop = this.hitbox.position.y;
      const hitboxBottom = this.hitbox.position.y + this.hitbox.height;
      const hitboxLeft = this.hitbox.position.x;
      const hitboxRight = this.hitbox.position.x + this.hitbox.width;

      const isVerticallyAligned =
        hitboxBottom > blockTop && hitboxTop < blockBottom;

      const isCollidingRight =
        this.direction > 0 &&
        hitboxRight + this.speed > blockLeft &&
        hitboxLeft < blockLeft;

      const isCollidingLeft =
        this.direction < 0 &&
        hitboxLeft - this.speed < blockRight &&
        hitboxRight > blockRight;

      if (isVerticallyAligned && (isCollidingRight || isCollidingLeft)) {
        // Reverse direction if a horizontal collision happens
        this.direction *= -1;
        break;
      }
    }
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

    // Check for horizontal collision before reaching patrol range limit
    this.checkHorizontalCollisions();

    if (
      this.position.x <= this.minX ||
      this.position.x + this.width >= this.maxX
    )
      this.direction *= -1;
  }

  checkPlayerCollision(object1, object2) {
    //1.check if both object exist
    if (!object1) return console.log("player not updated");
    if (!object2) return console.log("Block not updated");

    //2. Check for AABB collision, are we colliding with the ennemy,
    const isColliding =
      object1.hitbox.position.x < object2.hitbox.position.x + object2.width &&
      object1.hitbox.position.x + object1.hitbox.width >
        object2.hitbox.position.x &&
      object1.hitbox.position.y < object2.hitbox.position.y + object2.height &&
      object1.hitbox.position.y + object1.hitbox.height >
        object2.hitbox.position.y;

    //3.If the player and enemy are not colliding, then stop here and do nothing.
    if (!isColliding) return;

    //4.determine which side the player hit the enemy and act accordingly:
    // -if player on top of the ennemy, player bounce and  ennemy explode and disapear*
    // -if player collide left right or bottom player transparent and takes damages
    if (
      object1.hitbox.position.y + object1.hitbox.height <=
      object2.hitbox.position.y + 5
    ) {
      console.log("player hit from top");
      object1.velocity.y = -5;

      //each exploding enemy has its own copy of the explosion animation.(cf.preloadSprites)
      const config = spriteConfigs.enemyExplode;
      const baseHandler = config.handler; // already loaded via preloadSprites()
      this.imgRenderer = new ImageHandler(
        config.src,
        config.cols,
        config.rows,
        config.frameY
      );
      this.imgRenderer.image = baseHandler.image; //@ assigning the loaded image (the sprite sheet) from baseHandler to the imgRenderer.
      this.imgRenderer.loaded = true;
      this.config = this.imgRenderer; // Set `this.config` to the explosion handler
      this.isDead = true;
    } else {
      console.log(
        "Player hit from side or bottom — player takes damage or bounces"
      );
    }
  }

  draw() {
    // If enemy has been hit from top, show explosion
    if (this.isDead && this.imgRenderer && this.imgRenderer.loaded) {
      this.config.animate(); // Play animation from imgHandler method

      this.config.draw(
        //draw method from imgHandler
        this.ctx,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
      if (this.imgRenderer.frameX === this.imgRenderer.totalCols - 1) {
        this.markedForDeletion = true;
      }
    } else {
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
}

/* * to make the enemy disapear:
 1. Create a variable isDead and set it the true when player collide on top. this.isDead = true
 2. If enemy is dead, img sprite exist, and explosion animation reached last frame, flag it for deletion. /inside draw or update method/
      - if (this.isDead && this.imgRenderer &&  this.imgRenderer.frameX === this.imgRenderer.totalCols - 1)
      - Animation finished, mark for removal: this.markedForDeletion = true;

  @  baseHandler avoid us to reload the image and ensure that is the same loaded  sprite sheet we are using and then with 
    this.imgRenderer we create another instance in order to all the enemy to have their own explosions sprite? and why don't 
    we wrote  this.imgRenderer.image = baseHandler.image; before creating a new instance

*/
