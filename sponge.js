(function() {

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
  var MIN_PLAYER_RADIUS = 5; // as small as the player can get
  var MAX_PLAYER_RADIUS = 70; // as small as the player can get
  var BARRIER_POSITION = SCREEN_HEIGHT - 150; // upper bound of player movement


  /*
   * The Game object. This is the big banana! Contains much of the game's
   * state, logic, &c.
   */
  function Game() {
    this.canvas = {};
    this.context = {};
    this.mouseX = SCREEN_WIDTH / 2;
    this.mouseY = SCREEN_HEIGHT / 2;
    this.sponge = new Sponge(); // the player
    this.lines = []; // enemies!
  }

  /*
   * Set up canvas and context. Returns true if successful, false otherwise.
   */
  Game.prototype.initCanvas = function() {
    this.canvas = document.getElementById('world');
    if(this.canvas && this.canvas.getContext) {
      this.context = this.canvas.getContext('2d');
      this.canvas.width = SCREEN_WIDTH;
      this.canvas.height = SCREEN_HEIGHT;
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = (window.innerWidth - SCREEN_WIDTH) * 0.5 + 'px';
      this.canvas.style.top = (window.innerHeight - SCREEN_HEIGHT) * 0.5 + 'px';
      return true;
    }
    else {
      return false;
    }
  };

  /*
   * Callback to handle mouse movement.
   */
  Game.prototype.mouseMoveHandler = function(event) {
    // change document coordinates to canvas coordinates
    this.mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * 0.5;
    this.mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * 0.5;
  };

  /*
   * Set up event listener(s).
   */
  Game.prototype.initListeners = function() {
    var that = this;
    document.addEventListener('mousemove', function(event){that.mouseMoveHandler(event);});
  };

  /*
   * Create an initial number of enemies in the game.
   */
  Game.prototype.initEnemies = function(num) {
    for(var i = 0; i < num; i++) {
      this.lines.push(new Line());
    }
  };

  /*
   * Update the positions of the game's enemies... called every frame.
   */
  Game.prototype.updateEnemies = function() {
    var killList = []; // array of indices, offscreen lines to destroy

    // move each line down and check if it's offscreen yet
    for(var i = 0; i < this.lines.length; i++) {
      this.lines[i].move();

      // If the line is off the screen, add to kill list. (We can't just
      // destroy it here because that would fuck up array indexing.)
      if(this.lines[i].origin > SCREEN_HEIGHT) {
        killList.push(i);
      }
    }

    // kill the marked lines!
    for(var i = 0; i < killList.length; i++) {
      this.lines.splice(killList[i], 1);
    }
  };

  /*
   * Draw all the enemies in the lines array.
   */
  Game.prototype.drawEnemies = function() {
    for(var i = 0; i < this.lines.length; i++) {
      this.lines[i].draw(this.context);
    }
  };

  /*
   * Spawn a new enemy... maybe!
   */
  Game.prototype.maybeSpawnNewEnemy = function() {
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
  Game.prototype.checkForCollisions = function() {
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
        this.sponge.fillMeter++;
      }
      else {
        this.sponge.glowColor = ABSORBING_BAD;
        this.sponge.fillMeter--;
      }
    }
    else {
      this.sponge.glowColor = ABSORBING_NONE;
    }
  };

  /*
   * Draw barrier line!
   */
  Game.prototype.drawBarrierLine = function() {
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
  Game.prototype.mainLoop = function() {
    // use alpha to create a "fade out" effect
    this.context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // spawn new enemies every once in a while
    this.maybeSpawnNewEnemy();

    // update player and enemies
    this.sponge.move(this.mouseX, this.mouseY);
    this.sponge.update();
    this.updateEnemies();

    // check for collisions!
    this.checkForCollisions();

    // draw barrier, player and enemies
    this.drawEnemies();
    this.sponge.draw(this.context);
    this.drawBarrierLine();
    
    // draw score multiplier and score
    var scoreString = 'SCORE: ' + this.sponge.score.toString();
    drawText(this.context, scoreString, 10, 20, '15px', 'white');
    var multString = 'MULT x ' + this.sponge.multiplier.toString();
    drawText(this.context, multString, 10, 40, '15px', 'white');
  };

  /*
   * Set the magic in motion!
   */
  Game.prototype.start = function() {
    // This wonkiness is necessary since "this" gets reset to the window
    // object when setInterval is called. Thanks, JavaScript!
    var that = this;
    setInterval(function() {that.mainLoop();}, 1000 / FPS);
  };


  /*
   * The Sponge object -- the player of the game!
   */
  function Sponge() {
    this.radius = 20;
    this.centerX = SCREEN_WIDTH / 2;
    this.centerY = SCREEN_HEIGHT - this.radius;
    this.color = 'green';
    this.glowColor = ABSORBING_NONE; // player glows while absorbing lines
    this.fillMeter = 0; // how much has the player absorbed? (0 - 100)
    this.score = 0;
    this.multiplier = 1; // score multiplier
  }

  /*
   * Update the player's state, check if it's time to grow!
   */
  Sponge.prototype.update = function() {
    // If it's time to grow, then grow! will also raise score mult here later.
    if(this.fillMeter >= 100) {
      if(this.radius < MAX_PLAYER_RADIUS) {
        this.radius += 5;
        this.fillMeter = 0;
        this.multiplier = roundToTenth(this.multiplier + 0.1);
      }
      else {
        this.fillMeter = 99;
      }
    }

    // shrink...
    if(this.fillMeter < 0) {
      if(this.radius > MIN_PLAYER_RADIUS) {
        this.radius -= 5;
        this.fillMeter = 99;
        this.multiplier = roundToTenth(this.multiplier - 0.1);
      }
      else {
        this.fillMeter = 0;
      }
    }
  };

  /*
   * Move the player to coordinates specified.
   */
  Sponge.prototype.move = function(x, y) {
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
  Sponge.prototype.pointCollides = function(x, y) {
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
  Sponge.prototype.draw = function(context) {
    context.beginPath();
    context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = this.color;
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = this.glowColor;
    context.stroke();

    // fill in the circle to show how close to growing
    var endAngle = (2 * Math.PI * this.fillMeter) / 100;
    if(endAngle < 0) {
      endAngle = 0; // negative angles cause circle to fill back up!
    }
    context.beginPath();
    context.arc(this.centerX, this.centerY, this.radius, 0, endAngle, false);
    context.fillStyle = ABSORBING_NONE;
    context.fill();
  };


  /*
   * The Line object. The enemy... but also your key to embiggenment!
   */
  function Line() {
    this.length = randomInt(100, 300); // length of the line
    this.origin = 0 - this.length; // a Y value, the start of the line
    this.xPos = randomInt(0, SCREEN_WIDTH - 1); // X position of the line
    this.speed = 2; // how fast it moves downward
    this.color = COLORS[randomInt(0, COLORS.length - 1)]; // random color
  }

  /*
   * Update the line's position on the screen... called every frame.
   */
  Line.prototype.move = function() {
    this.origin += this.speed;
  };

  /*
   * Draw the line to the given context.
   */
  Line.prototype.draw = function(context) {
    context.beginPath();
    context.moveTo(this.xPos, this.origin);
    context.lineTo(this.xPos, this.origin + this.length);
    context.strokeStyle = this.color;
    context.lineWidth = 3;
    context.stroke();
  };


  /*
   * Draws text with given specs to given context.
   */
  function drawText(context, text, x, y, size, color) {
    context.font = size + ' courier';
    context.fillStyle = color;
    context.fillText(text, x, y);
  }


  /*
   * Return random integer between min and max (inclusive!).
   */
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  /*
   * Round given value to nearest tenth... necessary since adding and
   * subtracting 0.1 seems to be occasionally imprecise.
   */
  function roundToTenth(num) {
    return Math.round(num * 10) / 10;
  }


  /*
   * Set everything up: creates the canvas, creates the player, starts the game
   * loop.
   */
  (function main() {
    var game = new Game();
    if(game.initCanvas()) {
      game.initListeners();
      game.initEnemies(10); // 10 initial enemies
      game.start();
    }
    else {
      // something better later!
      alert("OH SHIT THERE'S A HORSE IN THE HOSPITAL");
    }
  })();

})();
