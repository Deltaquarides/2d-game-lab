import { removeHeart } from "../utils/heartManager.js";
import { coolDown, createSpriteRenderer } from "../utils/global_utilities.js";
import { Projectile } from "./projectile.js";

/*
    - defined enemy postions width and height
    - defined enemy hitbox
    - draw an square for debug
    - add gravity
    - add collision for the enely to stay on ground
*/
export class Enemy {
  constructor({
    ctx,
    collisionBlocks = [],
    mapBoundaries = null,
    enemyPositions = { x: 0, y: 0 },
    player = null,
    hearts = null,
    spriteType,
    lives,
  }) {
    //player class
    this.player = player;
    this.hearts = hearts; //same array shared  between the Enemy and the main game file, reference to 3 hearts
    this.lives = lives;
    this.position = {
      x: enemyPositions.x,
      y: enemyPositions.y,
    };
    this.width = 64;
    this.height = 64;

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
    this.patrolrange = 100;
    this.minX = this.position.x - this.patrolrange;
    this.maxX = this.position.x + this.patrolrange;
    this.detectionRange = 100;
    this.activated = false;

    //flags to remove enemy after explosion
    this.isDead = false;
    this.markedForDeletion = false;

    this.isOnGround = false; // ← track grounded state
    this.collisionBlocks = collisionBlocks;
    this.mapBoundaries = mapBoundaries;

    this.ctx = ctx;

    this.hasRecentlyHitPlayer = false;

    this.spriteType = spriteType;
    console.log(this.spriteType);

    //each exploding enemy has its own copy of the explosion animation.(cf.preloadSprites)
    this.explosionRenderer = createSpriteRenderer("effects", "enemyExplode");
    this.enemyExplode2 = createSpriteRenderer("effects", "enemyExplode2");

    switch (this.spriteType) {
      //each enemy  has his own copy of enemyLuxmn animation.(cf.preloadSprites)
      case "enemyLuxmn":
        this.currentRenderer = createSpriteRenderer("mignon", "enemyLuxmn");
        break;
      case "enemyAmazon":
        // to avoid flickering: pre-instantiate left & right facing sprite. in amazonFacePlayer switch them.
        this.amazonRendererLeft = createSpriteRenderer("enemyAmazon", "left");
        this.amazonRendererRight = createSpriteRenderer("enemyAmazon", "right");
        this.currentRenderer = this.amazonRendererRight; // default direction
        break;
      case "otile":
        this.otileRendererLeft = createSpriteRenderer("otile", "left");
        this.otileRendererRight = createSpriteRenderer("otile", "right");
    }

    this.fireBalls = [];
    this.canAttack = true;
    this.invisible = false;
  }

  //always face the player, for now only amazon and otile sprite can.
  facePlayer() {
    if (this.spriteType === "enemyAmazon") {
      this.currentRenderer =
        this.player.position.x + this.player.width <= this.position.x
          ? this.amazonRendererLeft
          : this.amazonRendererRight;
    } else if (this.spriteType === "otile") {
      {
        this.currentRenderer =
          this.player.position.x + this.player.width <= this.position.x
            ? this.otileRendererLeft
            : this.otileRendererRight;
      }
    }
  }

  //when player is hit change opacity
  setIsInvisible() {
    this.invinsible = true;
    setTimeout(() => {
      this.invinsible = false;
    }, 1000);
  }

  //attack of enemy, here otile will use fireball
  attackFireball() {
    if (!this.canAttack) return;
    if (!this.fireBalls) this.fireBalls = [];

    const facing =
      this.player.position.x + this.player.width <= this.position.x
        ? "left"
        : "right";

    let spriteKey;
    if (facing === "left") {
      spriteKey = "fireball_right";
    } else {
      spriteKey = "fireball_left";
    }

    console.log(spriteKey, "facing:", facing);
    const fireBall = new Projectile({
      x: this.hitbox.position.x,
      y: this.hitbox.position.y, // vertically center the spit
      speed: 2,
      facing: facing,
      spriteKey: spriteKey,
      collisionBlocks: this.collisionBlocks,
    });

    fireBall.startLifetime(2000);

    this.fireBalls.push(fireBall);

    this.canAttack = false;
    coolDown(this, "canAttack", true, 500);
  }

  giveDamageToPlayer() {
    this.fireBalls.forEach((fireBall) => {
      const fireCollidesWithPlayer =
        fireBall.hitbox.position.x <
          this.player.hitbox.position.x + this.player.hitbox.width &&
        fireBall.hitbox.position.x + fireBall.hitbox.width >
          this.player.hitbox.position.x &&
        fireBall.hitbox.position.y <
          this.player.hitbox.position.y + this.player.hitbox.height &&
        fireBall.hitbox.position.y + fireBall.hitbox.height >
          this.player.hitbox.position.y;

      if (fireCollidesWithPlayer) {
        console.log("Player is hit MAN!!!!");
        console.log("Player hit by fireball!");
        this.player.setIsInvisible(); // player opacity change when hit
        removeHeart(this.hearts); // remove 1 heart only
        coolDown(this, "canAttack", true, 500); // get damage again after cooldown
      } else if (this.hearts.length === 0) {
        this.player.setIsPlayerDead(); // player's dead sprite
        setTimeout(() => {
          // game over after 1000ms
          this.GameOverElement();
        }, 1000);
      }
    });
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

  //collisions between enemy and blocks horizontally, if collisions change direction.
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

  //check collisions between  enemy position map with edge. if collisions change direction.
  checkMapEdgeCollisions() {
    if (!this.mapBoundaries) return;

    const isLeftBoundtHit =
      this.direction < 0 &&
      this.hitbox.position.x - this.speed < this.mapBoundaries.leftEdge;
    const isRightBoundtHit =
      this.direction > 0 &&
      this.hitbox.position.x + this.hitbox.width + this.speed >
        this.mapBoundaries.rightEdge;
    if (isLeftBoundtHit || isRightBoundtHit) {
      this.direction *= -1;
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

  //obejct1; player, object2:enemy
  checkPlayerCollision(object1, object2) {
    //1.check if both object exist
    if (!object1) return console.log("player not updated");
    if (!object2) return console.log("enemy not updated");

    //  Skip any further collision checks if the enemy is already dead
    if (this.isDead) return;

    //2. Check for AABB collision, are we colliding with the ennemy,
    const isColliding =
      object1.hitbox.position.x <
        object2.hitbox.position.x + object2.hitbox.width &&
      object1.hitbox.position.x + object1.hitbox.width >
        object2.hitbox.position.x &&
      object1.hitbox.position.y <
        object2.hitbox.position.y + object2.hitbox.height &&
      object1.hitbox.position.y + object1.hitbox.height >
        object2.hitbox.position.y;

    //3.If the player and enemy are not colliding, then stop here and do nothing.
    if (!isColliding) return;

    //4.determine which side the player hit the enemy and act accordingly:
    // -if player on top of the ennemy, player bounce and  ennemy explode and disapear*
    // -if player collide left right or bottom player transparent and takes damages
    // Determine if player is hitting from the top
    const playerBottom = object1.hitbox.position.y + object1.hitbox.height;
    const enemyMidY = object2.hitbox.position.y + object2.hitbox.height / 2;

    const isTopHit =
      object1.velocity.y > 0 && // player must be falling
      playerBottom <= enemyMidY; // player is above midpoint of enemy

    if (isTopHit) {
      console.log("player hit from top");
      object1.velocity.y = -5;

      this.isDead = true;
      return; //exit the checkPlayerCollision() method early after successfully detecting a top-down hit on the enemy.
    } else if (!this.hasRecentlyHitPlayer) {
      this.hasRecentlyHitPlayer = true;

      this.player.setIsInvisible(); //change opacity when hit

      removeHeart(this.hearts); // remove 1 heart only

      coolDown(this, "hasRecentlyHitPlayer", false, 1000);
    } else if (this.hearts.length === 0) {
      this.player.setIsPlayerDead();

      setTimeout(() => {
        this.GameOverElement();
      }, 1000);
    }
  }

  GameOverElement() {
    const titleElement = document.getElementById("titleOver");
    if (titleElement) {
      //run after the DOM is ready otherwise null reference

      titleElement.innerText = "GAME OVER";
      titleElement.classList.add("gameOver");
    }
  }

  drawfireBAll() {
    // Remove expired fireBalls
    this.fireBalls = this.fireBalls.filter(
      (fireBall) => !fireBall.markedForDeletion
    );

    //draw spit attack
    if (this.fireBalls) {
      this.fireBalls.forEach((fireBall) => fireBall.draw(this.ctx));
      this.fireBalls.forEach((fireBall) => fireBall.update());
    }
  }

  drawDebug() {
    //debug hitbox
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(
      this.hitbox.position.x,
      this.hitbox.position.y,
      this.hitbox.width,
      this.hitbox.height
    );

    //debug
    this.ctx.strokeStyle = "blue";
    this.ctx.strokeRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  drawEnemy() {
    if (this.currentRenderer && this.currentRenderer.loaded) {
      this.currentRenderer.animate();
      this.ctx.globalAlpha = this.invinsible && this.isDead === false ? 0.5 : 1;

      // this enemy draws itself, using its own this.position.
      this.currentRenderer.draw(
        this.ctx,
        this.position.x,
        this.position.y,
        this.width,
        this.height
      );
    }
  }

  drawExplosion() {
    const otile = this.spriteType === "otile";
    const explosion = otile ? this.enemyExplode2 : this.explosionRenderer;
    const offset = otile ? 0 : 35;
    const widthExplosion = otile ? 64 : 32;

    if (explosion && explosion.loaded) {
      explosion.animate();
      explosion.draw(
        //draw method from imgHandler
        this.ctx,
        this.position.x,
        this.position.y + offset,
        widthExplosion,
        widthExplosion
      );

      //is we are the end of the sprite loop markForDeletion is true
      // explosion won't freeze at the last frame.
      if (explosion.frameX === explosion.cols - 1) {
        this.markedForDeletion = true;
      }
    }
  }

  draw() {
    if (this.isDead) {
      // If enemy has been hit from top(dead), show explosion
      this.drawExplosion();
    } else {
      this.drawEnemy();
      this.drawDebug();
    }
    this.drawfireBAll();
  }
  update() {
    this.updateHitbox();
    this.applyGravity();

    //in terms of performance and clarity, checking !this.activated is better avoiding
    if (!this.activated && this.isPlayerNearby()) {
      this.activated = true;
    }

    if (
      this.activated &&
      !this.isDead /*&& this.spriteType !== "enemyAmazon"*/
    ) {
      this.patrol();

      this.checkHorizontalCollisions();
      if (this.spriteType === "otile" && !this.player.playerIsDead) {
        this.attackFireball();
      }
    }

    this.checkOnGround();

    this.checkPlayerCollision(this.player, this); // this refer to the current enemy instance itself
    this.facePlayer();
    this.giveDamageToPlayer();
    this.checkMapEdgeCollisions();
    this.draw();
  }
}

/* * to make the enemy disapear:
 1. Create a variable isDead and set it the true when player collide on top. this.isDead = true
 2. If enemy is dead, img sprite exist, and explosion animation reached last frame, flag it for deletion. /inside draw or update method/
      - if (this.isDead && this.explosionRenderer &&  this.explosionRenderer.frameX === this.explosionRenderer.totalCols - 1)
      - Animation finished, mark for removal: this.markedForDeletion = true;

  @  baseHandler avoid us to reload the image and ensure that is the same loaded  sprite sheet we are using and then with 
    this.explosionRenderer we create another instance in order to all the enemy to have their own explosions sprite? and why don't 
    we wrote  this.explosionRenderer.image = baseHandler.image; before creating a new instance

*/
