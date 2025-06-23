//import { spriteConfigs } from "../utils/spriteConfigs.js";
import { getSpriteHandler } from "../utils/preloadSprites.js";
import { Projectile } from "./projectile.js";
import { coolDown } from "../utils/global_utilities.js";

let gravity = 0.5;

export class Player {
  constructor({
    x,
    y,
    collisionBlocks = [],
    collisionPlatforms = [],
    mapBoundaries = null,
    enemies = [],
  }) {
    this.playerIsDead = false;

    this.position = {
      x: x,
      y: y,
    };

    this.hitbox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      width: 25,
      height: 27,
    };

    this.velocity = {
      //Adding a velocity means giving it speed and direction — it controls how much the position changes per frame.
      //by giving for ex; x;1. The velocity will move 1 pixel on the x axis every frame about 60 times per second.
      x: 0,
      y: 0,
    };
    this.height = 60;
    this.width = 60;
    this.jumpMax = 2;
    this.jumpForce = -6;
    this.jumpCount = 0; // Track number of jumps (0 = on the ground, 1 = first jump, 2 = second jump)

    //default sprite Start with idle animation
    this.facing = "right";
    this.state = "idle"; // Track the current state: idle, walking, jumping, etc.

    this.imgRenderer = getSpriteHandler("idle");
    this.deathRenderer = getSpriteHandler("playerDeathSprite");

    if (!this.imgRenderer) {
      console.log("Failed to load sprite handler for 'idle'");
    } // Render by default the first sprite as idle state.

    this.collisionBlocks = collisionBlocks; // from colllisionsBlock class Map
    this.collisionPlatforms = collisionPlatforms;
    this.mapBoundaries = mapBoundaries;

    //will defined opcaticy of player when collide
    this.invinsible = false;

    this.spits = []; //initialize an array to track all spit projectiles
    this.canAttack = true;

    this.enemies = enemies;
  }

  //when player is hit change opacity
  setIsInvisible() {
    this.invinsible = true;
    setTimeout(() => {
      this.invinsible = false;
    }, 1000);
  }

  setIsPlayerDead() {
    this.playerIsDead = true;
  }

  attack() {
    //prevent player from attacking, if  canAttack is false it exits immediately the function
    if (!this.canAttack) return; // <-- IMPORTANT: prevent attack during cooldown

    //Ensures the spits array is safely initialized before use.
    //  otherwise If this.spits were undefined, trying to call this.spits.push(...) would throw an error
    if (!this.spits) this.spits = [];

    let spriteKey = this.facing === "right" ? "spit_right" : "spit_left";

    const spit = new Projectile({
      x:
        this.facing === "right"
          ? this.hitbox.position.x + 16
          : this.hitbox.position.x - 25,
      y: this.hitbox.position.y, // vertically center the spit
      speed: 5,
      facing: this.facing,
      spriteKey: spriteKey,
      collisionBlocks: this.collisionBlocks,
      mapBoundaries: this.mapBoundaries,
    });

    this.spits.push(spit);

    this.canAttack = false;
    coolDown(this, "canAttack", true, 600);

    //spit hit enemy
    this.isHit = false;
  }

  //if spit touch enemies do something.
  giveDamageToEnemy() {
    this.spits.forEach((spit) => {
      if (spit.isHit) return; // skip if already collided

      this.enemies.forEach((enemy) => {
        if (enemy.isDead) return; // skip if already dead

        if (
          spit.hitbox.position.x <
            enemy.hitbox.position.x + enemy.hitbox.width &&
          spit.hitbox.position.x + spit.hitbox.width >
            enemy.hitbox.position.x &&
          spit.hitbox.position.y <
            enemy.hitbox.position.y + enemy.hitbox.height &&
          spit.hitbox.position.y + spit.hitbox.height > enemy.hitbox.position.y
        ) {
          //avoid damage being undefined
          if (!enemy || !enemy.spriteType || typeof enemy.lives !== "number")
            return;

          let damage;
          switch (enemy.spriteType) {
            case "enemyLuxmn":
              damage = 1;
              break;
            case "enemyAmazon":
              damage = 1;
              break;
            case "otile":
              damage = 2;
              break;
          }
          enemy.lives -= damage;
          enemy.setIsInvisible();
          spit.speed = 0;
          spit.isHit = true; // Mark the spit so it doesn't damage again
          console.log(enemy.lives);

          // Remove enemy if no lives
          if (enemy.lives <= 0) {
            enemy.isDead = true;
          }
        }
      });
    });
    this.enemies = this.enemies.filter((enemy) => !enemy.isDead);
  }

  drawDebugBlocs(ctx) {
    this.collisionBlocks.forEach((bloc) => {
      bloc.draw(ctx);
    });
  }

  drawDebugPlatforms(ctx) {
    this.collisionPlatforms.forEach((platform) => {
      platform.draw(ctx);
    });
  }
  //now we need an update method to: change position using "velocity", applying gravity,
  //check collisions draws the player in the new position
  update(ctx) {
    this.drawDebugBlocs(ctx);
    this.drawDebugPlatforms(ctx);

    if (!this.playerIsDead) {
      this.updateHitbox(); //Any time you change position.x or position.y, call updateHitbox()
      //console.log("position y:", this.position.x, "position x:", this.position.y);
      this.position.x = this.position.x + this.velocity.x; // if velocity is for ex: +3 player will move to the right if négatif move to left.
      this.updateHitbox();

      this.checkForHorizontalCollisions();

      this.applyGravity();
      this.updateHitbox();

      this.checkForVerticalCollisions();
      this.checkForMapBoundaryCollisions();

      //console.log("Player Y:", this.position.y, "Velocity Y:", this.velocity.y);
    }
    this.giveDamageToEnemy();
    this.draw(ctx);
  }

  handleSpit(ctx) {
    // Remove expired projectiles
    this.spits = this.spits.filter((spit) => !spit.markedForDeletion);

    //draw spit attack
    if (this.spits) {
      this.spits.forEach((spit) => {
        spit.draw(ctx);
        spit.update(ctx);
      });
    }
  }

  drawPlayerDebug(ctx) {
    ctx.strokeStyle = "green";
    ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

    //hitbox
    ctx.strokeStyle = "green";
    ctx.strokeRect(
      this.hitbox.position.x,
      this.hitbox.position.y,
      this.hitbox.width,
      this.hitbox.height
    );
  }

  drawMapBoundariesDebug(ctx) {
    //map edge
    if (this.mapBoundaries) {
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(245, 221, 88, 0.5)";
      ctx.moveTo(this.mapBoundaries.topEdge, this.mapBoundaries.leftEdge);
      ctx.lineTo(
        this.mapBoundaries.topEdge,
        this.mapBoundaries.bottomEdge / 1.5
      );
      ctx.stroke();
      //console.log(this.mapBoundaries.bottomEdge);
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(245, 221, 88, 0.5)";
      ctx.moveTo(this.mapBoundaries.topEdge, this.mapBoundaries.leftEdge);
      ctx.lineTo(this.mapBoundaries.rightEdge, this.mapBoundaries.topEdge);
      ctx.stroke();

      ctx.stroke();
      //console.log(this.mapBoundaries.bottomEdge);
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(245, 221, 88, 0.5)";
      ctx.moveTo(this.mapBoundaries.rightEdge, this.mapBoundaries.leftEdge);
      ctx.lineTo(
        this.mapBoundaries.rightEdge,
        this.mapBoundaries.bottomEdge / 1.5
      );
      ctx.stroke();
    }
  }

  draw(ctx) {
    ctx.save();

    this.handleSpit(ctx);

    const renderer = this.playerIsDead ? this.deathRenderer : this.imgRenderer;
    // Set transparency if invincible
    ctx.globalAlpha = this.invinsible && this.playerIsDead === false ? 0.5 : 1;

    if (renderer) {
      renderer.animate(); // animate and draw method from class imgeHandler
      renderer.draw(
        ctx,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    } else {
      console.log("No valid sprite renderer available!");
    }

    //this.drawPlayerDebug(ctx);
    this.drawMapBoundariesDebug(ctx);

    ctx.restore();
  }

  //method to sync the hitbox to the current player position: box will move while player move
  //nothing to do with collisions, call it everytime position.x or position.y changes.
  updateHitbox() {
    this.hitbox.position.x =
      this.position.x + this.width / 2 - this.hitbox.width / 2; //middle vertically of render player
    this.hitbox.position.y = this.position.y + this.height - this.hitbox.height; //bottom horizontally of the render player
  }

  checkForHorizontalCollisions() {
    // Check horizontal collisions
    for (let block of this.collisionBlocks) {
      if (
        this.hitbox.position.x < block.position.x + block.width &&
        this.hitbox.position.x + this.hitbox.width > block.position.x &&
        this.hitbox.position.y < block.position.y + block.height &&
        this.hitbox.position.y + this.hitbox.height > block.position.y
      ) {
        // Collision from left
        if (this.velocity.x > 0) {
          // Moving left — place hitbox just to the right of block
          this.hitbox.position.x = block.position.x - this.hitbox.width;
          this.position.x =
            this.hitbox.position.x - (this.width / 2 - this.hitbox.width / 2);
          this.velocity.x = 0;

          break;
        }
        // Collision from right
        else if (this.velocity.x < 0) {
          // Moving right — place hitbox just to the left of block
          this.hitbox.position.x = block.position.x + block.width;

          this.velocity.x = 0;

          // Update player position based on hitbox
          this.position.x =
            this.hitbox.position.x - (this.width / 2 - this.hitbox.width / 2);

          break;
        }
      }
    }
    this.updateHitbox();
  }

  applyGravity() {
    this.velocity.y = this.velocity.y + gravity; // continue to fall
    // applying gravity if velocity is positif player move down, pulls down, if negatif player moves up, ex: a jump.
    this.position.y = this.position.y + this.velocity.y;
  }

  checkForVerticalCollisions() {
    // Check vertical collisions
    for (let block of this.collisionBlocks) {
      if (
        this.hitbox.position.x < block.position.x + block.width &&
        this.hitbox.position.x + this.hitbox.width > block.position.x &&
        this.hitbox.position.y < block.position.y + block.height &&
        this.hitbox.position.y + this.hitbox.height > block.position.y
      ) {
        const offsetY = this.hitbox.position.y - this.position.y;

        // Collision from top (falling down)
        if (this.velocity.y > 0) {
          this.jumpCount = 0; // Only reset jump on landing
          this.velocity.y = 0;
          this.position.y = block.position.y - offsetY - this.hitbox.height;
        }
        // Collision from bottom (jumping up)
        else if (this.velocity.y < 0) {
          this.velocity.y = 0;
          this.position.y = block.position.y + block.height - offsetY;
        }
        break;
      }
    }

    // call resolving a collision that moves the player, hitbox stays align with the player
    //  after the player has moved (either from normal movement or from being pushed back due to a collision).
    //A collision might force the player’s position.x or position.y to be changed.
    //Since the hitbox position depends on the player’s position, we must recalculate it.
    // That’s exactly what updateHitbox() does — it keeps the hitbox in the right place after any change.

    for (let platform of this.collisionPlatforms) {
      if (
        this.hitbox.position.x < platform.position.x + platform.width &&
        this.hitbox.position.x + this.hitbox.width > platform.position.x &&
        this.hitbox.position.y + this.hitbox.height <=
          platform.position.y + 10 && // Only if coming from above
        this.hitbox.position.y + this.hitbox.height + this.velocity.y >=
          platform.position.y
      ) {
        if (this.velocity.y > 0) {
          const offsetY = this.hitbox.position.y - this.position.y;
          this.jumpCount = 0;
          this.velocity.y = 0;
          this.position.y = platform.position.y - offsetY - this.hitbox.height;
          break;
        }
      }
    }
    this.updateHitbox();
  }

  checkForMapBoundaryCollisions() {
    if (!this.mapBoundaries) return;
    // Left boundary
    if (this.hitbox.position.x < this.mapBoundaries.leftEdge) {
      this.hitbox.position.x = this.mapBoundaries.leftEdge;
      this.velocity.x = 0;
      this.position.x =
        this.hitbox.position.x - (this.width / 2 - this.hitbox.width / 2);
    }

    // Right boundary
    if (
      this.hitbox.position.x + this.hitbox.width >
      this.mapBoundaries.rightEdge
    ) {
      this.hitbox.position.x = this.mapBoundaries.rightEdge - this.hitbox.width;
      this.velocity.x = 0;
      this.position.x =
        this.hitbox.position.x - (this.width / 2 - this.hitbox.width / 2);
    }

    // Top boundary
    if (this.hitbox.position.y < this.mapBoundaries.topEdge) {
      this.hitbox.position.y = this.mapBoundaries.topEdge;
      this.velocity.y = 0;
      this.position.y =
        this.hitbox.position.y - this.height + this.hitbox.height;
    }
  }

  // Jump method: Increase jumpCount if jumps are available
  doubleJump() {
    if (this.jumpCount < this.jumpMax) {
      // Allow up to two jumps (double jump)
      this.velocity.y = this.jumpForce; // Set the upward jump velocity
      this.jumpCount++; // Increment the jump count
      this.state = "jumping";
      // console.log(`Jump ${this.jumpCount}`);
    }
  }

  jump() {
    this.doubleJump();
    // console.log("DOUBLEjump:", this.jumpCount);
  }

  walk(direction) {
    if (direction === "left") {
      this.velocity.x = -3;
      this.state = "walking";
      this.facing = "left";
    } else if (direction === "right") {
      this.facing = "right";

      this.velocity.x = 3;
      this.state = "walking";
    }
  }

  stopWalking() {
    this.velocity.x = 0;
    this.state = "idle"; // Switch to idle state when not walking
  }
}
