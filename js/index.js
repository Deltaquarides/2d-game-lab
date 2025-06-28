import { Player } from "../classes/Player.js";
import { eventListeners } from "./eventListeners.js";
import { preloadSprites } from "../utils/preloadSprites.js";
import { Map } from "../classes/map.js";
import { Camera } from "../classes/camera.js";
import { Enemy } from "../classes/ennemy.js";
import { level1Enemies, level1items } from "../utils/levelEnemy.js";
import { Heart } from "../classes/heart.js";
import { introLevel } from "../utils/global_utilities.js";
import { Items } from "../classes/items.js";

const canvas = document.getElementById("myCanvas"); //retrieves the node in the DOM representing the <canvas>
canvas.width = window.innerWidth;
canvas.height = 980; //window.innerHeight;
const ctx = canvas.getContext("2d"); // Once we have the element node, we can access the drawing context using its getContext() method

//levels of the game
let map = new Map();

// Preload sprites before creating player, all sprite are ready!!!
let player;
let camera;
let enemies = [];
let hearts = [];
let heartCount = 5;

let ring = [];
let ringNumberCollected = 0;

introLevel("Shy Hills Zone", "ACT 1");

//create hearts
function createHearts() {
  for (let i = 0; i < heartCount; i++) {
    hearts.push(
      new Heart({
        x: 15 + i * 20,
        y: 10,
        width: 16,
        height: 16,
        imageSrc: "../images/hearts.png",
      })
    );
  }
}

//draw Hearts
function drawUi() {
  hearts.forEach((heart) => {
    const offsetX = camera.x; // moves UI hearts with the camera, canvas  shifs the drawing context (semms like it's moving) not the hearts
    heart.drawUI(ctx, offsetX);
  });
}

//draw all rings and rings count
function drawRings() {
  ring.forEach((r) => {
    r.update();
  });
}

function incrementRingCounter() {
  ringNumberCollected++;
}

function drawRingsName() {
  const offsetX = camera.x;
  const itemName = "Rings:";
  ctx.font = "10px monospace";
  ctx.strokeStyle = "rgba(13, 49, 231)";
  ctx.strokeText(itemName, 15 + offsetX, 40, 16);
}

function drawRingsNumber() {
  if (!ring) return; //  Wait until rings are created
  const offsetX = camera.x;
  ctx.font = "bold  monospace";
  ctx.strokeStyle = "rgba(13, 49, 231)";
  ctx.strokeText(
    ` ${ringNumberCollected} / ${level1items.length}`,
    33 + offsetX,
    40,
    16
  );
}

map.ready.then(() => {
  preloadSprites().then(() => {
    //for each {x,y} in the array create a new instance of enemy, pass enemyPositions: pos, to the constructor.
    enemies = level1Enemies.map((e) => {
      return new Enemy({
        ctx: ctx,
        collisionBlocks: map.collisionBlocks,
        collisionPlatforms: map.collisionPlatforms,
        mapBoundaries: map.mapBoundaries,
        enemyPositions: { x: e.x, y: e.y },
        player,
        hearts,
        spriteType: e.type || "enemyLuxmn",
        lives: e.lives || 2,
      });
    });

    player = new Player({
      x: 0,
      y: 100,
      collisionBlocks: map.collisionBlocks,
      collisionPlatforms: map.collisionPlatforms,
      mapBoundaries: map.mapBoundaries,
      enemies,
      getRingCount: () => ringNumberCollected, // access the latest value using callback
    });

    // Now that player exists, assign the player reference to enemies otherwise
    //player inside Enemy class would be undefined
    enemies.forEach((enemy) => (enemy.player = player));

    eventListeners(player); // pass the object player to eventListeners as an argument so it can acces for ex player.velocity ect...
    camera = new Camera({ ctx, player });

    createHearts();

    ring = level1items.map((r) => {
      return new Items({
        ctx: ctx,
        itemsPotisions: { x: r.x, y: r.y },
        player,
        onCollect: incrementRingCounter,
      });
    });
  });
});

function animate() {
  try {
    if (!camera) {
      requestAnimationFrame(animate);
      return;
    }
    // Wait until camera is ready

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear old frame

    // Save transformation state
    ctx.save();
    ctx.scale(4, 4); // Zoom in
    //ctx.translate(0, 100); //if x coordinate change to a negative value camera system like effects
    camera.update();
    camera.applyTransform();
    // Wait for the map to load before drawing. Everything is drawn in order, the last thing drawn appears on top.

    ctx.imageSmoothingEnabled = false; // This property is useful for games and other apps that use pixel art. When enlarging images, the default resizing algorithm will blur the pixels. Set this property to false to retain the pixels' sharpness.
    map.drawMap(ctx);

    player.update(ctx); // Update position + draw new frame

    enemies.forEach((enemy) => enemy.update()); //enemy.update();
    //  Remove dead enemies after explosion animation is done
    enemies = enemies.filter((enemy) => !enemy.markedForDeletion);

    // Draw collision boxes (for debugging)
    map.collisionBlocks.forEach((block) => block.draw(ctx));

    drawUi();
    ring = ring.filter((r) => !r.markedForDeletion);
    drawRings();

    //if player is not dead show rings count
    if (!player.playerIsDead) {
      drawRingsName();
      drawRingsNumber();
    }

    ctx.restore(); // Restore default canvas state (no scale, no translate)

    requestAnimationFrame(animate); // Loop again
  } catch (err) {
    console.error("Animation error:", err); // This will tell where it crashes
  }
}
animate();
