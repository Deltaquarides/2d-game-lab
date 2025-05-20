/*    
          *** GOOD TO KNOW ***
top right corner   top-> y      
    (x,y)   +--------------------+  <- right top corner -> (x+width, y )
            |                    |      
    left    |                    |   right   
      x     |       SQUARE       |  x+width
            |                    |
   bottom   |                    |
left corner |                    |
(x,y+height)+--------------------+  <- (x+width, y+width)
               bottom-> y+height   
--------------------------------------------------------------------------------------

              ****  GRAVITY & GROUND ****
 1. To simulate gravity for the player to gradually fall, by gradually increasing the y velocity:
 add a variable named "gravity" and give it a value
 
2. stop the player when their bottom edge hits the bottom of the ground.
  - player bottom: this.position.y + this.height --> y move downward, if y = 100, player start at 100, and its height 25, so 125 for its feet.
  - ground level: canvas.height
  - collide with ground : this.position.y + this height >= canvas.height
  - Feet on the ground: this.position.y = canvas.height - this.height; 
  - stop falling: this.velocity.y = 0


                ****  PLAYER MOVEMENTS logic****
   1. add evendListeners to listen for events, "keydown"and "keyup" are the types of events.
      pass to the callback an event object {code} to extract the code property from the event.
   2. to stop when keyup set the velovity of "x" or "y" to "0".


               *** STOP INFINITE JUMPING logic***
  1. Need to know if the player is on the ground by : this.position.y + this.height >= canvas.height if 100 is >600
  2. Add inOnGround check in the Player class to check if the player is touching the ground exactly, if yes we can jump: velocity -= 10
  3. Modify in the update method using isOnGround, if the Player is not on the ground continue falling by apllying gravity else stop gravity: velocity = 0.
     add in case of "ArrowUp"in evenListeners if player is on the ground he can jump.

               *** ADD DOUBLE JUMP logic***
  1. Create a variable and assign a value to 0: this.jumpCount = 0
  2. Create a function that will increment the value of jumpCount and set the velocity upward
  3. in eventListeners if jumpcount < 2 call the function jump function.

              *** STOP SQUARE FLICKERING logic ***
  Since the sprite image is loading, just like a fetch call or any asynchronous operation
  where we track when it's done or not, using the flag "isloading". used like a custom flag to confirm image is loaded.

  1. Add property "loaded" to imageHandler class instance.

             *** preloadSprites FILE ***
    help to:
      - load all image sprite --> avoid flickering.
      - sprite base on keybord events.

    Here we attach a single ImageHandler instance to spriteConfig by assigning it to each config.handler,
    later in eventListeners we assign that handler to player.imgRenderer.
    This allows the Player class to use the animate() and draw() methods from ImageHandler during the game loop
    in index.js, we call preloadSprites() befor calling making a new instance of Player.
    This prevents reloading the same image multiple times.

            **** Platform Logic ***


            ---------
            
            ****double jump for eventListeners ****

    explaination of adding jumpPressed:
    The keydown event only fires once when a key is initially pressed — holding the key doesn’t trigger repeated keydown events for jumping. As a result:
    If we press and hold the jump key (like ArrowUp), only one jump() call is triggered.
    To trigger a double jump, the key must be released and pressed again before landing.
    But in our case, the second press might not be triggering correctly, or it's being ignored if the key is still "held down" in the Set.
 */
