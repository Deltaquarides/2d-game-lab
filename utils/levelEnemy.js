// array of position objects for each level

export const level1Enemies = [
  { x: 40, y: 10, lives: 2 },
  { x: 120, y: 10, lives: 2 },
  { x: 200, y: 100, lives: 2 },
  { x: 300, y: 100, lives: 2 },
  { x: 600, y: 100, type: "enemyAmazon", lives: 4 },
  { x: 750, y: 100, lives: 2 },
  { x: 850, y: 100, lives: 2 },
  { x: 970, y: 80, lives: 2 },
  { x: 990, y: 80, lives: 2 },
  { x: 1020, y: 80, lives: 2 },
  { x: 1090, y: 80, type: "otile", lives: 10 },
  { x: 1150, y: 80, lives: 2 },
  { x: 1200, y: 80, lives: 2 },
  { x: 1450, y: 80, type: "enemyAmazon", lives: 8 },
];

export const levelData = {
  1: {
    map: {
      layers: [
        "./map/shy_Hills/l_New_Layer_1.json",
        "./map/shy_Hills/l_New_Layer_2.json",
        "./map/shy_Hills/l_New_Layer_3.json",
        "./map/shy_Hills/l_New_Layer_4.json",
        "./map/shy_Hills/l_New_Layer_5.json",
        "./map/shy_Hills/l_New_Layer_6.json",
        "./map/shy_Hills/l_New_Layer_7.json",
      ],
      collisions: "./map/shy_Hills/collisions.json",
      tilesets: ["./images/decorations.png", "./images/tileset.png"],
    },
    enemies: [
      { x: 40, y: 10, lives: 2 },
      { x: 120, y: 10, lives: 2 },
      // ... other enemies ...
    ],
    items: [
      { x: 25, y: 55 },
      { x: 45, y: 55 },
      // ... other items ...
    ],
  },
  2: {
    map: {
      layers: [
        "./map/Dark_Cave/l_New_Layer_1.json",
        "./map/Dark_Cave/l_New_Layer_2.json",
        "./map/Dark_Cave/l_New_Layer_3.json",
        "./map/Dark_Cave/l_New_Layer_4.json",
        "./map/Dark_Cave/l_New_Layer_5.json",
        "./map/Dark_Cave/l_New_Layer_6.json",
        "./map/Dark_Cave/l_New_Layer_7.json",
      ],
      collisions: "./map/Dark_Cave/collisions.json",
      tilesets: ["./images/decorations.png", "./images/tileset.png"],
    },
    enemies: [
      { x: 100, y: 50, lives: 2 },
      { x: 200, y: 100, lives: 2 },
    ],
    items: [
      { x: 50, y: 50 },
      { x: 70, y: 70 },
    ],
  },
};
