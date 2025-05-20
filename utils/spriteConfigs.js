// easy managing of frame total, sprite can have 6, 7 frame or else
/*this object holds configuration for each sprite animation
each property (like:walk_right, walk_left) contains metadata about the sprite
(it's source, number of colums ect...)
*/
export const spriteConfigs = {
  walk_right: {
    src: "../images/dan/walk_right.png",
    cols: 6,
    rows: 1,
    frameY: 0,
    handler: null,
  },
  walk_left: {
    src: "../images/dan/walk_left.png",
    cols: 6,
    rows: 1,
    frameY: 0,
    handler: null,
  },
  jump: {
    src: "../images/dan/jump.png",
    cols: 7,
    rows: 1,
    frameY: 0,
    handler: null,
  },
  idle: {
    src: "../images/dan/idle.png",
    cols: 7,
    rows: 1,
    frameY: 0,
    handler: null,
  },
  jump_left: {
    src: "../images/dan/jump_left.png",
    cols: 7,
    rows: 1,
    frameY: 0,
    handler: null,
  },
  idle_left: {
    src: "../images/dan/idle_left.png",
    cols: 7,
    rows: 1,
    frameY: 0,
    handler: null,
  },
};
