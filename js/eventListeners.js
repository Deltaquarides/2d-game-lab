import { spriteConfigs } from "../utils/spriteConfigs.js";

/* 
 **** export pb for the variable imageSrc ****
if we export directly this variable that is being reassign inside eventListeners function
it won't work, imports are read-only live bindings, in import we will see undefined
instead of importing imageSrc we wrap in a getter function
assign to imageSrc a default sprite
*/

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
