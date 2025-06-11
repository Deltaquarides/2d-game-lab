import { Player } from "../classes/Player.js";
import { eventListeners } from "./eventListeners.js";
import { preloadSprites } from "../utils/preloadSprites.js";
import { Map } from "../classes/map.js";
import { Camera } from "../classes/camera.js";
import { Enemy } from "../classes/ennemy.js";
import { level1Enemies } from "../utils/levelEnemy.js";
import { Heart } from "../classes/heart.js";
import { introLevel } from "../utils/global_utilities.js";

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
const heartCount = 5;

introLevel("Shy Hills Zone", "ACT 1");

map.ready.then(() => {
  preloadSprites().then(() => {
    //for each {x,y} in the array create a new instance of enemy, pass enemyPositions: pos, to the constructor.
    enemies = level1Enemies.map((e) => {
      return new Enemy({
        ctx: ctx,
        collisionBlocks: map.collisionBlocks,
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
      mapBoundaries: map.mapBoundaries,
      hearts,
      enemies,
    });

    // Now that player exists, assign the player reference to enemies otherwise
    //player inside Enemy class would be undefined
    enemies.forEach((enemy) => (enemy.player = player));

    eventListeners(player); // pass the object player to eventListeners as an argument so it can acces for ex player.velocity ect...
    camera = new Camera({ ctx, player });

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
    animate();
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
    ctx.scale(3, 3); // Zoom in
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

    // Remove Hearts
    //hearts = hearts.filter((heart) => !heart.markedForDeletion);
    hearts.forEach((heart) => heart.update(ctx));

    // Draw collision boxes (for debugging)
    map.collisionBlocks.forEach((block) => block.draw(ctx));
    if (camera) {
      camera.drawDebug();
    }

    ctx.restore(); // Restore default canvas state (no scale, no translate)

    //player.update(ctx, canvas); // Update position + draw new frame
    requestAnimationFrame(animate); // Loop again
  } catch (err) {
    console.error("Animation error:", err); // This will tell where it crashes
  }
}
