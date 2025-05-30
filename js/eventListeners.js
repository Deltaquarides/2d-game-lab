import { getSpriteHandler } from "../utils/preloadSprites.js";

/* 
 **** export pb for the variable imageSrc ****
if we export directly this variable that is being reassign inside eventListeners function
it won't work, imports are read-only live bindings, in import we will see undefined
instead of importing imageSrc we wrap in a getter function
assign to imageSrc a default sprite
*/

let currentPlayer = null;

function eventListeners(player) {
  currentPlayer = player;
}

const keyPressed = new Set();

window.addEventListener("keydown", ({ code }) => {
  if (!currentPlayer) return;

  keyPressed.add(code);

  const isRight = keyPressed.has("ArrowRight") || keyPressed.has("KeyD");
  const isLeft = keyPressed.has("ArrowLeft") || keyPressed.has("KeyA");
  const isUp = keyPressed.has("ArrowUp") || keyPressed.has("KeyW");
  const isDown = keyPressed.has("ArrowDown") || keyPressed.has("KeyS");

  if (isRight) {
    currentPlayer.walk("right");
    currentPlayer.facing = "right";
    currentPlayer.imgRenderer = getSpriteHandler("walk_right");
    //currentPlayer.imgRenderer = spriteConfigs.walk_right.handler;
  }
  if (isLeft) {
    currentPlayer.walk("left");
    currentPlayer.facing = "left";
    //walk_left.handler
    currentPlayer.imgRenderer = getSpriteHandler("walk_left");
  }
  if (isUp) {
    currentPlayer.jump();
    currentPlayer.imgRenderer =
      currentPlayer.facing === "left"
        ? getSpriteHandler("jump_left")
        : getSpriteHandler("jump");
  }
  if (isDown) {
    currentPlayer.velocity.y = 20;
  }
});

window.addEventListener("keyup", ({ code }) => {
  if (!currentPlayer) return;

  keyPressed.delete(code);

  const isRight = keyPressed.has("ArrowRight") || keyPressed.has("KeyD");
  const isLeft = keyPressed.has("ArrowLeft") || keyPressed.has("KeyA");

  if (!isLeft && !isRight) {
    currentPlayer.stopWalking();

    if (currentPlayer.facing === "left") {
      currentPlayer.imgRenderer =
        getSpriteHandler("idle_left") ?? getSpriteHandler("idle");
    } else {
      currentPlayer.imgRenderer = getSpriteHandler("idle");
    }
  }
});

export { eventListeners };

/*
function eventListeners(player) {
  function getMovementStates(keyPressed) {
    // shared Function to avoid duplicating same variable evenListener in keydown and keyUp.
    return {
      isRight: keyPressed.has("ArrowRight") || keyPressed.has("KeyD"),
      isLeft: keyPressed.has("ArrowLeft") || keyPressed.has("KeyA"),
      isUp: keyPressed.has("ArrowUp") || keyPressed.has("KeyW"),
      isDown: keyPressed.has("ArrowDown") || keyPressed.has("KeyS"),
    };
  }

  const keyPressed = new Set(); //built-in JavaScript object that stores unique values of any type

  addEventListener("keydown", ({ code }) => {
    keyPressed.add(code);

    const { isRight, isLeft, isDown, isUp } = getMovementStates(keyPressed);
    if (isRight) {
      player.walk("right");
      player.facing = "right";
      player.imgRenderer = spriteConfigs.walk_right.handler;
    }
    if (isLeft) {
      player.walk("left");
      player.facing = "left";
      player.imgRenderer = spriteConfigs.walk_left.handler;
    }
    if (isUp) {
      //console.log("Jump key pressed");
      player.jump();
      if (player.facing === "left") {
        player.imgRenderer = spriteConfigs.jump_left.handler;
      } else {
        player.imgRenderer = spriteConfigs.jump.handler;
      }
    }
    if (isDown) {
      player.velocity.y = 20;
    }
  });

  addEventListener("keyup", ({ code }) => {
    keyPressed.delete(code); // remove key when released

    const { isRight, isLeft, isDown, isUp } = getMovementStates(keyPressed);

    // Stop walking only if neither left nor right are pressed
    if (!isLeft && !isRight) {
      player.stopWalking();

      // Set idle animation based on the direction the player was facing
      if (player.facing === "left") {
        player.imgRenderer =
          spriteConfigs.idle_left?.handler ?? spriteConfigs.idle.handler;
      } else {
        player.imgRenderer = spriteConfigs.idle.handler;
      }
    }
  });
}

export { eventListeners };
*/
