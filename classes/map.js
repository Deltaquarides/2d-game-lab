import { createImage } from "../utils/createImage.js";
import { loadMap } from "../utils/loadMap.js";
import { CollisionsBox } from "./collisionsBox.js";

export class Map {
  constructor() {
    this.tileSize = 16;
    this.layers = [];
    this.tilesets = [];
    this.layerTilesetMap = {}; // To map layers to tilesets
    this.collisions = null;
    this.collisionBlocks = []; // Add this line

    this.ready = Promise.all([
      loadMap("./map/shy_Hills/l_New_Layer_1.json"), //load layers via "laodMap" function that handle fetch
      loadMap("./map/shy_Hills/l_New_Layer_2.json"),
      loadMap("./map/shy_Hills/l_New_Layer_3.json"),
      loadMap("./map/shy_Hills/l_New_Layer_4.json"),
      loadMap("./map/shy_Hills/l_New_Layer_5.json"),
      loadMap("./map/shy_Hills/l_New_Layer_6.json"),
      loadMap("./map/shy_Hills/l_New_Layer_7.json"),
      loadMap("./map/shy_Hills/collisions.json"),

      createImage("./images/decorations.png"), //load the map image via "createImage" promises
      createImage("./images/tileset.png"),
    ])
      .then(
        ([
          layer1,
          layer2,
          layer3,
          layer4,
          layer5,
          layer6,
          layer7,
          collisions,
          decorations,
          tileset,
        ]) => {
          this.layers = [
            layer1,
            layer2,
            layer3,
            layer4,
            layer5,
            layer6,
            layer7,
          ];
          this.tilesets = [tileset, decorations];
          // Map layers to specific tilesets
          this.layerTilesetMap = {
            0: decorations, // Layer 1 uses tileset2
            1: decorations, // Layer 2 uses tileset1
            2: tileset, // Layer 3 uses tileset2
            3: decorations,
            4: decorations,
            5: tileset,
            6: tileset,
          };
          this.collisions = collisions;
          this.boxColisions();
          console.log(
            "tileset width:",
            tileset.width,
            "tileset height:",
            tileset.height
          );
          console.log(
            "decorations width:",
            decorations.width,
            "decorations height:",
            decorations.height
          );
          if (tileset.width === 0 || tileset.height === 0) {
            console.warn("Tileset image failed to load properly.");
          }
          if (decorations.width === 0 || decorations.height === 0) {
            console.warn("⚠️ Decorations failed to load: width or height is 0");
          }
          //console.log("layer1 length:", layer1);
          this.mapHeight = layer1.length;
          this.mapWidth = layer1[1].length;
          this.mapBoundaries = {
            leftEdge: 0,
            topEdge: 0,
            rightEdge: this.mapWidth * this.tileSize,
            bottomEdge: this.mapHeight * this.tileSize,
          };
        }
      )

      .catch((err) => {
        console.error("Failed to load map or images:", err);
      });
  }

  //render blocks and platforms from the collisions file array.
  boxColisions() {
    for (let y = 0; y < this.collisions.length; y++) {
      for (let x = 0; x < this.collisions[y].length; x++) {
        let coliVal = this.collisions[y][x]; // grab the value stored at position (x, y).

        if (coliVal === 1) {
          //if calidVal === 1 create a new instance of CollisionsBox to create a box everytime value of the collision array equal to 1.
          this.collisionBlocks.push(
            new CollisionsBox({
              position: {
                x: x * this.tileSize,
                y: y * this.tileSize,
              },
              width: 16,
              height: 16,
            })
          );
          //console.log(`Value 2 found at x: ${x}, y: ${y}`);
        } else if (coliVal === 2) {
          this.collisionBlocks.push(
            new CollisionsBox({
              position: {
                x: x * this.tileSize,
                y: y * this.tileSize + 16,
              },
              width: 16,
              height: 16,
            })
          );
        }
      }
    }
  }

  drawMap(ctx) {
    if (!this.layers || !this.tilesets) return; //skip drawing if not loaded
    //const imageWidth = 560;
    //const imageHeigt = 688;
    // const tilesetCols = imageWidth / tileSize; // colomn & width of the imported tileset
    let mapIndex = 0;
    let sourceX = 0;
    let sourceY = 0;

    // Loop over each layer and draw its tiles
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const tileset = this.layerTilesetMap[i]; // assume 1 tileset per layer for now
      if (!tileset) continue;
      const tilesetCols = tileset.width / this.tileSize;

      for (let y = 0; y < layer.length; y++) {
        for (let x = 0; x < layer[y].length; x++) {
          let tileVal = layer[y][x];
          if (tileVal == 0) continue;
          tileVal -= 1;
          sourceY = Math.floor(tileVal / tilesetCols) * this.tileSize;
          sourceX = (tileVal % tilesetCols) * this.tileSize;
          // console.log(tileVal);
          //console.log(sourceX);
          //console.log(sourceY);

          ctx.drawImage(
            tileset,
            sourceX,
            sourceY,
            this.tileSize,
            this.tileSize,
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
        mapIndex++;
      }
    }
  }
}
