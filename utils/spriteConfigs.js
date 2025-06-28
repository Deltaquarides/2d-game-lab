// easy managing of frame total, sprite can have 6, 7 frame or else
/*this object holds configuration for each sprite animation
each property (like:walk_right, walk_left) contains metadata about the sprite
(it's source, number of colums ect...)
*/

export const spriteConfigs = {
  player: {
    walk_right: {
      src: "/images/dan/walk_right.png",
      totalCols: 6,
      totalRows: 1,
      frameY: 0,
    },
    walk_left: {
      src: "/images/dan/walk_left.png",
      totalCols: 6,
      totalRows: 1,
      frameY: 0,
    },
    jump: {
      src: "/images/dan/jump.png",
      totalCols: 7,
      totalRows: 1,
      frameY: 0,
    },
    idle: {
      src: "/images/dan/idle.png",
      totalCols: 7,
      totalRows: 1,
      frameY: 0,
    },
    jump_left: {
      src: "/images/dan/jump_left.png",
      totalCols: 7,
      totalRows: 1,
      frameY: 0,
    },
    idle_left: {
      src: "/images/dan/idle_left.png",
      totalCols: 7,
      totalRows: 1,
      frameY: 0,
    },
    playerDeathSprite: {
      src: "/images/player-death.png",
      totalCols: 6,
      totalRows: 1,
      frameY: 0,
      frameSpeed: 8,

      loopOnce: true,
    },
  },
  effects: {
    enemyExplode: {
      src: "/images/enemy-death.png",
      totalCols: 6,
      totalRows: 1,
      frameY: 0,
      loopOnce: true,
    },
    enemyExplode2: {
      src: "/images/Explosion.png",
      totalCols: 12,
      totalRows: 1,
      frameY: 0,
      loopOnce: true,
    },
  },
  mignon: {
    enemyLuxmn: {
      src: "/images/enemyLuxmn.png",
      totalCols: 7,
      totalRows: 1,
      frameY: 0,
    },
  },
  otile: {
    right: {
      src: "/images/Otile_right_sprite.png",
      totalCols: 9,
      totalRows: 1,
      frameY: 0,
    },
    left: {
      src: "/images/Otile_left_sprite.png",
      totalCols: 9,
      totalRows: 1,
      frameY: 0,
    },
  },
  enemyAmazon: {
    left: {
      src: "/images/amazon/amazon_left.png",
      totalCols: 8,
      totalRows: 1,
      frameY: 0,
    },
    right: {
      src: "/images/amazon/amazon_right.png",
      totalCols: 8,
      totalRows: 1,
      frameY: 0,
    },
  },
  spit: {
    spit_right: {
      src: "/images/spit_right.png",
      totalCols: 6,
      totalRows: 1,
      frameY: 0,
    },
    spit_left: {
      src: "/images/spit_left.png",
      totalCols: 6,
      totalRows: 1,
      frameY: 0,
    },
    spit_crash_right: {
      src: "/images/spit_crash_right.png",
      totalCols: 7,
      totalRows: 1,
      frameY: 0,
    },
    spit_crash_left: {
      src: "/images/spit_crash_left.png",
      totalCols: 7,
      totalRows: 1,
      frameY: 0,
    },
  },
  fireBalls: {
    fireball_left: {
      src: "/images/fireball_left.png",
      totalCols: 4,
      totalRows: 1,
      frameY: 0,
    },
    fireball_right: {
      src: "/images/fireball_right.png",
      totalCols: 4,
      totalRows: 1,
      frameY: 0,
    },
  },
  items: {
    ring: {
      src: "/images/coin_sprite.png",
      totalCols: 4,
      totalRows: 1,
      frameY: 0,
    },
    ringExplosion: {
      src: "/images/coin_explosion.png",
      totalCols: 5,
      totalRows: 1,
      frameY: 0,
    },
  },
};
