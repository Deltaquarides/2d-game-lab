import { Player } from "../classes/Player.js";
import { eventListeners } from "./eventListeners.js";
import { preloadSprites } from "../utils/preloadSprites.js";
import { Map } from "../classes/map.js";
import { Camera } from "../classes/camera.js";
import { Enemy } from "../classes/ennemy.js";
import { levelData } from "../utils/levelEnemy.js";
import { Heart } from "../classes/heart.js";
import { introLevel } from "../utils/global_utilities.js";
import { Items } from "../classes/items.js";
import { createImage } from "../utils/createImage.js";
import { AudioPlayer } from "../classes/AudioPlayer .js";
import { addHeart } from "../utils/heartManager.js";
//-- SETUP CANVAS --//
const canvas = document.getElementById("myCanvas"); //retrieves the node in the DOM representing the <canvas>
canvas.width = window.innerWidth;
canvas.height = 920; //window.innerHeight;
const ctx = canvas.getContext("2d"); // Once we have the element node, we can access the drawing context using its getContext() method
//-- CONFIG --//

//-- SOUND CONFIG--//
export const audioPlayer = new AudioPlayer({
  sounds: {
    typing: "./sound/keyboard_typing.wav",
    coin: "./sound/pick_coin.wav",
    jump: "./sound/jump.mp3",
    spit: "./sound/spitting.mp3",
    plop: "./sound/plop.mp3",
    playerDead: "./sound/playerDead.wav",
    playerHit: "./sound/playerHit.wav",
    luxmanShout: "./sound/luxmanShout.wav",
    luxmanDead: "./sound/luxmanDead.wav",
    amazonDead: "./sound/amazonDead.wav",
    amazonShout: "/sound/amazonShout.wav",
    otileCaralho: "./sound/otileCaralho.wav",
    otileDead: "./sound/otileDead.wav",
    musicLevel1: "./sound/shy_hills_theme.mp3",
    musicLevel2: "./sound/cave_theme.mp3",
    musicEndGame: "./sound/ending_theme.wav",
    moreHeart: "./sound/moreHeart.wav",
  },
});

//-- GLOBALS --//
let currentLevel = 1; /********************** DONT FORGET TO CHANGE TO 1  ************************ */
let levelLoading = false;
let endGame = false;
let endGameImg = null;
let hasEndMusicStarted = false; //only play the music once using this flag

createImage("../images/heroPic.png").then((image) => {
  endGameImg = image;
});

//levels of the game
let map;

// Preload sprites before creating player, all sprite are ready!!!
let player;
let camera;
let enemies = [];
let hearts = [];
let heartCount = 5;
let ring = [];
let ringNumberCollected = 0;
let totalRings = 0;

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
function drawUi({ offsetX, offsetY }) {
  hearts.forEach((heart) => {
    heart.drawUI(ctx, offsetX, offsetY);
  });
}

//draw all rings and rings count
function drawRings() {
  ring.forEach((r) => {
    r.update();
  });
}

//****FUNCTION TO ACCES LIVE THE NUMBER OF RING COLLECTED */
function incrementRingCounter() {
  audioPlayer.stopAudio("coin");
  ringNumberCollected++;
  audioPlayer.playAudio({ name: "coin", volume: 0.2 });
  // Check if we need to add a bonus heart
  if (
    ringNumberCollected === Math.floor(0.8 * totalRings) ||
    ringNumberCollected === totalRings
  ) {
    audioPlayer.playAudio({ name: "moreHeart", volume: 0.3 });
    addHeart(hearts, {
      x: 15 + hearts.length * 20,
      y: 10,
      width: 16,
      height: 16,
      imageSrc: "../images/hearts.png",
    });
  }
}
//****FUNCTION TO ACCES LIVE THE TOTAL NUMBER OF RING  */
export function getTotalRings() {
  return (totalRings = levelData[currentLevel].items.length - 1);
}

//**********************HANDLE RING  NAME AND COUNT  UI************************************* */

function drawRingsName({ offsetX, offsetY, ringColor }) {
  const itemName = "Rings:";
  ctx.font = "10px monospace";
  ctx.strokeStyle = ringColor;
  ctx.strokeText(itemName, 15 + offsetX, 40 + offsetY, 25);
}

function drawRingsNumber({ offsetX, offsetY, ringColor }) {
  if (!ring) return; //  Wait until rings are created
  ctx.font = "bold  monospace";
  ctx.strokeStyle = ringColor;
  ctx.strokeText(
    ` ${ringNumberCollected} / ${levelData[currentLevel].items.length - 1}`,
    40 + offsetX,
    40 + offsetY,
    25
  );
}
/*********************************************** */

function loadLevel(levelNumber) {
  const level = levelData[levelNumber];
  totalRings = levelData[currentLevel].items.length - 1;

  function playLevelTheme(levelNumber) {
    // Stop any currently playing looping sounds ( background music)
    for (const [name, audio] of Object.entries(audioPlayer.sounds)) {
      if (!audio.paused && audio.loop) {
        audioPlayer.stopAudio(name);
      }
    }
    console.log(levelData[levelNumber].themeName);
    audioPlayer.playAudio({
      name: levelData[levelNumber].themeName,
      volume: 0.1,
      loop: true,
    });
  }
  currentLevel = levelNumber;

  playLevelTheme(levelNumber);

  levelLoading = true; // we're now loading a level

  if (!level) {
    console.warn("Level not found:", levelNumber);
    return;
  }

  ringNumberCollected = 0;
  hearts = [];
  enemies = [];
  ring = [];

  map = new Map(level.map);
  introLevel(level.map.name, level.map.levelNumber);

  // is a custom Promise that gets set inside the Map constructor.
  // It uses Promise.all to wait for all map JSON and images.
  // The rest of the game setup runs only after everything is loaded
  map.ready.then(() => {
    preloadSprites().then(() => {
      console.log("✅ Finished loading level", currentLevel);

      //for each {x,y} in the array create a new instance of enemy, pass enemyPositions: pos, to the constructor.
      enemies = level.enemies.map((e) => {
        return new Enemy({
          ctx: ctx,
          collisionBlocks: map.collisionBlocks,
          collisionPlatforms: map.collisionPlatforms,
          mapBoundaries: map.mapBoundaries,
          enemyPositions: { x: e.x, y: e.y },
          player,
          hearts,
          spriteType: e.type || "enemyLuxmn",
          lives: e.lives ?? 2, // if in levelEnemy.js lives is not specify default to 2
          canMove: e.canMove ?? true, // <---- same here
        });
      });

      player = new Player({
        x: 0,
        y: 80,
        collisionBlocks: map.collisionBlocks,
        collisionPlatforms: map.collisionPlatforms,
        mapBoundaries: map.mapBoundaries,
        enemies,
        getRingCount: () => ringNumberCollected, // access the latest value using callback
      });

      // Now that player exists, we assign the player reference to enemies otherwise
      //player inside Enemy class would be undefined
      enemies.forEach((enemy) => (enemy.player = player));
      eventListeners(player); // pass the object player to eventListeners as an argument so it can acces for ex player.velocity ect...
      camera = new Camera({ ctx, player });

      createHearts();

      ring = level.items.map((r) => {
        return new Items({
          ctx: ctx,
          itemsPotisions: { x: r.x, y: r.y },
          player,
          onCollect: incrementRingCounter,
        });
      });
      levelLoading = false; // finished loading everything!
    });
  });
}

function loadNextMap() {
  if (levelLoading) return; // don't do anything while loading

  const totalLevels = Object.keys(levelData).length;

  if (
    enemies.length === 0 &&
    ringNumberCollected >= totalRings &&
    currentLevel < totalLevels
  ) {
    levelLoading = true; // prevent duplicate calls during delay

    setTimeout(() => loadLevel(currentLevel + 1), 2000);
    return;
  }

  const isGameComplete = currentLevel === totalLevels && enemies.length === 0;

  if (isGameComplete) {
    setTimeout(() => {
      endGame = true;
    }, 2000);
  }
}

function typetext({ x, y, text, color, font, delay, onComplete }) {
  for (let i = 0; i <= text.length; i++) {
    audioPlayer.playAudio({ name: "typing", volume: 0.2 });
    setTimeout(() => {
      let partialText = "";

      for (let j = 0; j < i; j++) {
        partialText = partialText + text[j];
      }

      ctx.clearRect(x - 10, y - 40, 1000, 50); // clear only this text area
      ctx.fillStyle = color;
      ctx.font = font;
      ctx.shadowColor = "red";
      ctx.shadowBlur = 10;

      function drawMultilineText() {
        let lineY = y;
        console.log(lineY);
        for (let k = 0; k < partialText.length; k += 50) {
          const line = partialText.slice(k, k + 50);

          ctx.fillText(line, x, lineY);
          lineY += 100;
        }
      }
      drawMultilineText();

      if (i === text.length) {
        audioPlayer.stopAudio("typing");
        if (onComplete) {
          //  callback when first typetext typing is done
          onComplete();
        }
      }
    }, i * delay);
  }
}

function animate() {
  try {
    if (!camera) {
      requestAnimationFrame(animate);
      return;
    }
    // Wait until camera is ready
    // if game end stop previous music and play end music and show end scene
    if (endGame) {
      if (!hasEndMusicStarted) {
        for (const [name, audio] of Object.entries(audioPlayer.sounds)) {
          if (!audio.paused && audio.loop) {
            audioPlayer.stopAudio(name);
          }
        }
        audioPlayer.playAudio({
          name: "musicEndGame",
          volume: 0.2,
          loop: true,
        });
        hasEndMusicStarted = true;
      }
      if (endGameImg) {
        // Draw background and image ONCE
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.shadowColor = "rgb(255 0 0 / 80%)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.drawImage(endGameImg, 25, 100, 600, 800);
        ctx.restore();

        typetext({
          x: canvas.width / 2,
          y: canvas.height - 100,
          text: "🏆 Bravo! Game Complete!",
          color: "blue",
          font: "40px monospace",
          delay: 200,
          onComplete: () => {
            typetext({
              x: canvas.width / 2.5,
              y: 290,
              text: "Ainsi naquit la légende du D., dont le courage triompha de sa timidité. Cependant d'autres dangers guettent notre héros. Pourra t- il viancre ses démons? Pourra t-il trouver sa bien aimée? Espéront lui une bonne chance!",
              color: "blue",
              font: "60px Brush Script MT, Brush Script Std, cursive",
              delay: 100,
            });
          },
        });
      }
      //   requestAnimationFrame(animate);
      return;
    }

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

    loadNextMap();

    // Draw collision boxes (for debugging)
    map.collisionBlocks.forEach((block) => block.draw(ctx));

    const offsetX = camera.x; // moves UI hearts with the camera, canvas  shifs the drawing context (semms like it's moving) not the hearts
    const offsetY = camera.y > 0 ? 0 : -camera.y;

    drawUi({ offsetX, offsetY });
    ring = ring.filter((r) => !r.markedForDeletion);
    drawRings({ offsetX, offsetY });

    //"ringColor"min coin to collect  is "40%" for the text to turn red
    const collected = ringNumberCollected;

    const ringColor =
      collected === totalRings
        ? "rgba(236, 37, 11, 1)"
        : collected >= 0.4 * totalRings
        ? "rgba(77, 236, 28, 1)"
        : "rgba(37, 20, 231, 1)";
    //if player is not dead show rings count
    if (!player.playerIsDead) {
      drawRingsName({ offsetX, offsetY, ringColor });
      drawRingsNumber({ offsetX, offsetY, ringColor });
    }

    // camera.drawDebug();

    ctx.restore(); // Restore default canvas state (no scale, no translate)

    requestAnimationFrame(animate); // Loop again
  } catch (err) {
    console.error("Animation error:", err); // This will tell where it crashes
  }
}

//-- START GAME --//
function initGame() {
  loadLevel(currentLevel);
  animate();
  document.getElementById("startMessage").style.display = "none";
  document.getElementById("startVideo").hidden = true;
}

document.addEventListener("keydown", initGame, { once: true });
