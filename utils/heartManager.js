import { Heart } from "../classes/heart.js";

//remove the last  heart
export const removeHeart = (heartArray) => {
  if (heartArray.length > 0) {
    heartArray.pop(); // remove the last heart immediately
  }
};

// add in the last position a heart by creating a new Heart instance
export const addHeart = (heartArray, heartConfig) => {
  const heart = new Heart(heartConfig);
  heartArray.push(heart);
};
