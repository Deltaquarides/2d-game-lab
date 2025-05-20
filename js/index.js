import { Player } from "../classes/Player.js";
import { eventListeners } from "./eventListeners.js";
import { preloadSprites } from "../utils/preloadSprites.js";
import { Map } from "../classes/map.js";
import { Camera } from "../classes/camera.js";
import { Enemy } from "../classes/ennemy.js";
import { level1Enemies } from "../utils/levelEnemy.js";

const canvas = document.getElementById("myCanvas"); //retrieves the node in the DOM representing the <canvas>
canvas.width = window.innerWidth;
canvas.height = 980; //window.innerHeight;
const ctx = canvas.getContext("2d"); // Once we have the element node, we can access the drawing context using its getContext() method
console.log(ctx);

//levels of the game
const map = new Map();

// Preload sprites before creating player, all sprite are ready!!!

let player;
let camera;
let enemies = [];
console.log("level1Enemies", level1Enemies);

map.ready.then(() => {
  preloadSprites();

  player = new Player(400, 100, map.collisionBlocks, map.mapBoundaries);
  eventListeners(player, canvas); // pass the object player to eventListeners as an argument so it can acces for ex player.velocity ect...
  camera = new Camera(ctx, player);
  enemies = level1Enemies.map((pos) => {
    return new Enemy(ctx, map.collisionBlocks, pos, player);
  });
  console.log("Created enemies", enemies);
});

function animate() {
  try {
    if (!camera) return requestAnimationFrame(animate); // Wait until camera is ready

    // console.log("Animating frame...");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear old frame

    // Save transformation state
    ctx.save();
    ctx.scale(2, 2); // Zoom in
    //ctx.translate(0, 100); //if x coordinate change to a negative value camera system like effects
    camera.update();
    camera.applyTransform();
    // Wait for the map to load before drawing. Everything is drawn in order, the last thing drawn appears on top.
    map.ready
      .then(() => {
        ctx.imageSmoothingEnabled = false; // This property is useful for games and other apps that use pixel art. When enlarging images, the default resizing algorithm will blur the pixels. Set this property to false to retain the pixels' sharpness.
        map.drawMap(ctx);
      })
      .then(() => {
        player.update(ctx, canvas); // Update position + draw new frame
        enemies.forEach((enemy) => enemy.update()); //enemy.update();
        // Draw collision boxes (for debugging)
        map.collisionBlocks.forEach((block) => block.draw(ctx));
        camera.drawDebug();
      })

      .finally(() => {
        ctx.restore(); // Restore default canvas state (no scale, no translate)

        //player.update(ctx, canvas); // Update position + draw new frame
        requestAnimationFrame(animate); // Loop again
        //console.log("go");
      });
  } catch (err) {
    console.error("Animation error:", err); // This will tell where it crashes
  }
}
animate();
