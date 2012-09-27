(function(window, s, undefined) {
  'use strict';

  /*
   * The Game object. This is the big banana! Contains much of the game's
   * state, logic, &c.
   */
  s.Game = function() {
    this.canvas = {};
    this.context = {};
    this.mouseX = s.SCREEN_WIDTH / 2;
    this.mouseY = s.SCREEN_HEIGHT / 2;
    this.sponge = new s.Sponge(); // the player
    this.lines = []; // enemies!
  };


  /*
   * Set up canvas and context. Returns true if successful, false otherwise.
   */
  s.Game.prototype.initCanvas = function() {
    this.canvas = document.getElementById('world');
    if(this.canvas && this.canvas.getContext) {
      this.context = this.canvas.getContext('2d');
      this.canvas.width = s.SCREEN_WIDTH;
      this.canvas.height = s.SCREEN_HEIGHT;
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = (window.innerWidth - s.SCREEN_WIDTH) * 0.5 + 'px';
      this.canvas.style.top = (window.innerHeight - s.SCREEN_HEIGHT) * 0.5 + 'px';
      return true;
    }
    else {
      return false;
    }
  };


  /*
   * Callback to handle mouse movement.
   */
  s.Game.prototype.mouseMoveHandler = function(event) {
    // change document coordinates to canvas coordinates
    this.mouseX = event.clientX - (window.innerWidth - s.SCREEN_WIDTH) * 0.5;
    this.mouseY = event.clientY - (window.innerHeight - s.SCREEN_HEIGHT) * 0.5;
  };


  /*
   * Set up event listener(s).
   */
  s.Game.prototype.initListeners = function() {
    var that = this;
    document.addEventListener('mousemove', function(event){that.mouseMoveHandler(event);});
  };


  /*
   * Create an initial number of enemies in the game.
   */
  s.Game.prototype.initEnemies = function(num) {
    for(var i = 0; i < num; i++) {
      this.lines.push(new s.Line());
    }
  };


  /*
   * Update the positions of the game's enemies... called every frame.
   */
  s.Game.prototype.updateEnemies = function() {
    var killList = []; // array of indices, offscreen lines to destroy

    // move each line down and check if it's offscreen yet
    for(var i = 0; i < this.lines.length; i++) {
      this.lines[i].move();

      // If the line is off the screen, add to kill list. (We can't just
      // destroy it here because that would fuck up array indexing.)
      if(this.lines[i].origin > s.SCREEN_HEIGHT) {
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
  s.Game.prototype.drawEnemies = function() {
    for(var i = 0; i < this.lines.length; i++) {
      this.lines[i].draw(this.context);
    }
  };


  /*
   * Spawn a new enemy... maybe!
   */
  s.Game.prototype.maybeSpawnNewEnemy = function() {
    // make this value variable later, more enemies will spawn as game
    // progresses
    if(Math.random() < 0.04) {
      this.lines.push(new s.Line());
    }
  };


  /*
   * Check for collisions between player and enemies, updates player status
   * accordingly.
   */
  s.Game.prototype.checkForCollisions = function() {
    var isCollision = false;
    var isAbsorbing = false;

    // loop through every enemy on the screen, checking for collisions
    for(var i = 0; i < this.lines.length; i++) {
      // check each point along the line, from the origin to origin + length
      for(var j = this.lines[i].origin; j < (this.lines[i].origin + this.lines[i].length); j++) {
        if(this.sponge.pointCollides(this.lines[i].xPos, j)) {
          isCollision = true;
          // same color, player absorbs it
          if(s.COLORS[this.sponge.color] === this.lines[i].color) {
            isAbsorbing = true;
          }
        }
      }
    }

    if(isCollision) {
      if(isAbsorbing) {
        this.sponge.glowColor = s.ABSORBING_GOOD;
        this.sponge.fillMeter++;
        this.sponge.score = s.roundToTenth(this.sponge.score + this.sponge.multiplier);
      }
      else {
        this.sponge.glowColor = s.ABSORBING_BAD;
        this.sponge.fillMeter--;
      }
    }
    else {
      this.sponge.glowColor = s.DARK_COLORS[this.sponge.color];
    }
  };


  /*
   * Draw barrier line!
   */
  s.Game.prototype.drawBarrierLine = function() {
    this.context.beginPath();
    this.context.moveTo(0, s.BARRIER_POSITION - 5); // account for line
    this.context.lineTo(s.SCREEN_WIDTH, s.BARRIER_POSITION - 5); // same here
    this.context.strokeStyle = 'white';
    this.context.lineWidth = 5;
    this.context.stroke();
  };


  /*
   * Main event loop, called every frame.
   */
  s.Game.prototype.mainLoop = function() {
    // use alpha to create a "fade out" effect
    this.context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.context.fillRect(0, 0, s.SCREEN_WIDTH, s.SCREEN_HEIGHT);

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
    s.drawText(this.context, scoreString, 10, 20, '15px', 'white');
    var multString = 'MULT x ' + this.sponge.multiplier.toString();
    s.drawText(this.context, multString, 10, 40, '15px', 'white');
  };


  /*
   * Set the magic in motion!
   */
  s.Game.prototype.start = function() {
    // This wonkiness is necessary since "this" gets reset to the window
    // object when setInterval is called. Thanks, JavaScript!
    var that = this;
    setInterval(function() {that.mainLoop();}, 1000 / s.FPS);
  };

})(window, window.sponge = window.sponge || {});
