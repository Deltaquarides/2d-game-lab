export class AudioPlayer {
  constructor({ sounds }) {
    //----> sounds contain object sounds as in index.js line 23 to 39
    this.sounds = {}; // Initialize sound storage

    // Preload all sounds once
    for (const [name, src] of Object.entries(sounds)) {
      const audio = new Audio(src);
      audio.preload = "auto"; // Start loading the video as soon as the page loads
      this.sounds[name] = audio;
    }
  }

  playAudio({ name, volume = 1, loop = false }) {
    const sound = this.sounds[name];
    if (!sound) return;
    sound.loop = loop;
    sound.volume = volume;
    sound.play();
  }

  pauseAudio(name) {
    const sound = this.sounds[name];
    if (!sound) return;
    sound.pause();
  }

  playPartAudio({ name, begin, end, volume = 1 }) {
    const sound = this.sounds[name];
    if (!sound) return;

    // Set the current time to the 'begin' time and start playback
    sound.currentTime = begin;
    sound.volume = volume;
    // Add a small delay to allow for proper buffering

    sound.play();
    sound.ontimeupdate = () => {
      console.log("Current time: ", sound.currentTime); // Debugging current time
      if (sound.currentTime >= end) {
        sound.pause();
        sound.currentTime = begin; // Reset for future playback
      }
    };
  }

  stopAudio(name) {
    const sound = this.sounds[name];
    if (!sound) {
      console.warn(`Sound "${name}" not found`);
      return;
    }
    this.pauseAudio(name);

    this.sounds[name].currentTime = 0;
  }
}

/*
Note: 2 main steps: 
 1- Create one AudioPlayer instance.
 2- For each sound:
    . Create a new Audio object with the file source.
    . Set audio.preload to auto so it's loads immediately.
    . Store it in this.sounds[name] for quick access later.
 

*** 1- Create the instance once***

const audioPlayer = new AudioPlayer({
  jump: "./sounds/jump.wav",
  hit: "./sounds/hit.wav",
  attack: "./sounds/attack.wav",
  win: "./sounds/win.mp3",
  musicLevel1: "./sounds/music1.mp3",
});

*** 2- Loop over each sound****

    for (const [name, src] of Object.entries(sounds)) {...}

*** Reuse without instanciating everytime new Audio()

audioPlayer.play("musicLevel1", { loop: true, volume: 0.5 });
audioPlayer.play("jump");
audioPlayer.stop("musicLevel1");


****  wrong approach ****

Without the 2 steps above: we would instanciate for every sound like so:

const jumpSound = new AudioPlayer("./sounds/jump.mp3");
const jumpTrak = new AudioPlayer(jumpSound);
jumpTrack.playAudio();

"OR"

const jumpSound = new Audio("./sounds/jump.mp3");
jumpSound.play();

*/
