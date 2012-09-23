// we like it STRICT, baby
'use strict';


// some useful "constants"
var SCREEN_WIDTH = 900;
var SCREEN_HEIGHT = 600;
var FPS = 60; // shoot for 60 fps animation
var COLORS = ['purple', 'green', 'blue', 'yellow']; // enemy colors
var ABSORBING_GOOD = 'white'; // player absorbing same color
var ABSORBING_BAD = 'red'; // player absorbing other color
var ABSORBING_NONE = '#003300'; // absorbing nothing!
var BARRIER_POSITION = SCREEN_HEIGHT - 150; // upper bound of player's movement


/*
 * The Game object. This is the big banana! Contains much of the game's state,
 * logic, &c. Also useful to keep all this nonsense out of the global
 * namespace...
 */
function Game() {
  this.canvas;
  this.context;
  this.mouseX = SCREEN_WIDTH / 2;
  this.mouseY = SCREEN_HEIGHT / 2;
  this.sponge = new Sponge(); // the player
  this.lines = []; // enemies!

  /*
   * Set up canvas and context.
   */
  this.initCanvas = function() {
    this.canvas = document.getElementById('world');
    if(this.canvas && this.canvas.getContext) {
      this.context = this.canvas.getContext('2d');
    }
    else {
      // do something real here later...
      alert("OH SHIT THERE'S A HORSE IN THE HOSPITAL");
    }

    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = (window.innerWidth - SCREEN_WIDTH) * 0.5 + 'px';
    this.canvas.style.top = (window.innerHeight - SCREEN_HEIGHT) * 0.5 + 'px';
  };

  /*
   * Callback to handle mouse movement.
   */
  this.mouseMoveHandler = function(event) {
    // change document coordinates to canvas coordinates
    this.mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * 0.5;
    this.mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * 0.5;
  };

  /*
   * Set up event listener(s).
   */
  this.initListeners = function() {
    var that = this;
    document.addEventListener('mousemove', function(event){that.mouseMoveHandler(event);});
  };

  /*
   * Create an initial number of enemies in the game.
   */
  this.initEnemies = function(num) {
    for(var i = 0; i < num; i++) {
      this.lines.push(new Line());
    }
  };

  /*
   * Update the positions of the game's enemies... called every frame.
   */
  this.updateEnemies = function() {
    for(var i = 0; i < this.lines.length; i++) {
      this.lines[i].move();
    }
  };

  /*
   * Draw all the enemies in the lines array.
   */
  this.drawEnemies = function() {
    for(var i = 0; i < this.lines.length; i++) {
      this.lines[i].draw(this.context);
    }
  };

  /*
   * Spawn a new enemy... maybe!
   */
  this.maybeSpawnNewEnemy = function() {
    // make this value variable later, more enemies will spawn as game
    // progresses
    if(Math.random() < 0.04) {
      this.lines.push(new Line());
    }
  };

  /*
   * Check for collisions between player and enemies, updates player status
   * accordingly.
   */
  this.checkForCollisions = function() {
    var isCollision = false;
    var isAbsorbing = false;

    // loop through every enemy on the screen, checking for collisions
    for(var i = 0; i < this.lines.length; i++) {
      // check each point along the line, from the origin to origin + length
      for(var j = this.lines[i].origin; j < (this.lines[i].origin + this.lines[i].length); j++) {
        if(this.sponge.pointCollides(this.lines[i].xPos, j)) {
          isCollision = true;
          // same color, player absorbs it
          if(this.sponge.color === this.lines[i].color) {
            isAbsorbing = true;
          }
        }
      }
    }

    if(isCollision) {
      if(isAbsorbing) {
        this.sponge.glowColor = ABSORBING_GOOD;
      }
      else {
        this.sponge.glowColor = ABSORBING_BAD;
      }
    }
    else {
      this.sponge.glowColor = ABSORBING_NONE;
    }
  };

  /*
   * Draw barrier line!
   */
  this.drawBarrierLine = function() {
    this.context.beginPath();
    this.context.moveTo(0, BARRIER_POSITION - 5); // account for line
    this.context.lineTo(SCREEN_WIDTH, BARRIER_POSITION - 5); // same here
    this.context.strokeStyle = 'white';
    this.context.lineWidth = 5;
    this.context.stroke();
  };

  /*
   * Main event loop, called every frame.
   */
  this.mainLoop = function() {
    // use alpha to create a "fade out" effect
    this.context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // spawn new enemies every once in a while
    this.maybeSpawnNewEnemy();

    // update player and enemies
    this.sponge.move(this.mouseX, this.mouseY);
    this.updateEnemies();

    // check for collisions!
    this.checkForCollisions();

    // draw barrier, player and enemies
    this.drawBarrierLine();
    this.drawEnemies();
    this.sponge.draw(this.context);
  };

  /*
   * Set the magic in motion!
   */
  this.start = function() {
    // This wonkiness is necessary since "this" gets reset to the window object
    // when setInterval is called. Thanks, JavaScript!
    var that = this;
    setInterval(function() {that.mainLoop();}, 1000 / FPS);
  };
}


/*
 * The Sponge object -- the player of the game!
 */
function Sponge() {
  this.radius = 20;
  this.centerX = SCREEN_WIDTH / 2;
  this.centerY = SCREEN_HEIGHT - this.radius;
  this.color = 'green';
  this.glowColor = ABSORBING_NONE; // player glows while absorbing lines

  /*
   * Move the player to coordinates specified.
   */
  this.move = function(x, y) {
    this.centerX = x;
    this.centerY = y;

    // don't allow player off the screen or past barrier
    if(this.centerX + this.radius >= SCREEN_WIDTH) {
      this.centerX = SCREEN_WIDTH - this.radius;
    }
    if(this.centerX - this.radius <= 0) {
      this.centerX = this.radius;
    }
    if(this.centerY - this.radius <= BARRIER_POSITION) {
      this.centerY = BARRIER_POSITION + this.radius;
    }
    if(this.centerY + this.radius >= SCREEN_HEIGHT) {
      this.centerY = SCREEN_HEIGHT - this.radius;
    }
  };

  /*
   * Check if a given point is within the bounds of the circle that makes up
   * the player. Returns true or false.
   */
  this.pointCollides = function(x, y) {
    // Thanks, Pythagoras!
    if(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2) < Math.pow(this.radius, 2)) {
      return true;
    }
    else {
      return false;
    }
  };

  /*
   * Draw the player to the given context.
   */
  this.draw = function(context) {
    context.beginPath();
    context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = this.color;
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = this.glowColor;
    context.stroke();
  };
}


/*
 * The Line object. The enemy... but also your key to embiggenment!
 */
function Line() {
  this.length = randomInt(100, 300); // length of the line
  this.origin = 0 - this.length; // a Y value, the start of the line
  this.xPos = randomInt(0, SCREEN_WIDTH - 1); // X position of the line
  this.speed = 2; // how fast it moves downward
  this.color = COLORS[randomInt(0, COLORS.length - 1)]; // random color

  /*
   * Update the line's position on the screen... called every frame.
   */
  this.move = function() {
    this.origin += this.speed;
  };

  /*
   * Draw the line to the given context.
   */
  this.draw = function(context) {
    context.beginPath();
    context.moveTo(this.xPos, this.origin);
    context.lineTo(this.xPos, this.origin + this.length);
    context.strokeStyle = this.color;
    context.lineWidth = 3;
    context.stroke();
  };
}


/*
 * Draw text to the given context.
 */
function drawText(text, context, x, y) {
  context.font = '20px Arial';
  context.fillStyle = 'yellow';
  context.fillText(text, x, y);
}


/*
 * Return random integer between min and max (inclusive!).
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


/*
 * Set everything up: creates the canvas, creates the player, starts the game
 * loop.
 */
(function main() {
  var game = new Game();
  game.initCanvas();
  game.initListeners();
  game.initEnemies(10); // 10 initial enemies
  game.start();
})();
