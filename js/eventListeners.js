import { getSpriteHandler } from "../utils/preloadSprites.js";
import { getTotalRings } from "./index.js";

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
  const spitAttack = keyPressed.has("Numpad0") || keyPressed.has("Space");

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
  if (
    spitAttack &&
    currentPlayer.canAttack &&
    !currentPlayer.playerIsDead &&
    currentPlayer.getRingCount() >= 0.4 * getTotalRings()
  ) {
    currentPlayer.attack();
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
