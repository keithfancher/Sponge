(function(window, s, undefined) {
  'use strict';

  /*
   * The Sponge object -- the player of the game!
   */
  s.Sponge = function() {
    this.radius = 20;
    this.centerX = s.SCREEN_WIDTH / 2;
    this.centerY = s.SCREEN_HEIGHT - this.radius;
    this.color = s.randomInt(0, s.COLORS.length - 1); // random color (index!)
    this.glowColor = s.DARK_COLORS[this.color]; // "halo" color
    this.fillMeter = 0; // how much has the player absorbed? (0 - 100)
    this.score = 0;
    this.multiplier = 1; // score multiplier
  };


  /*
   * Update the player's state, check if it's time to grow!
   */
  s.Sponge.prototype.update = function() {
    // If it's time to grow, then grow! will also raise score mult here later.
    if(this.fillMeter >= 100) {
      if(this.radius < s.MAX_PLAYER_RADIUS) {
        this.radius += 5;
        this.fillMeter = 0;
        this.multiplier = s.roundToTenth(this.multiplier + 0.1);
      }
      else {
        this.fillMeter = 99;
      }
    }

    // shrink...
    if(this.fillMeter < 0) {
      if(this.radius > s.MIN_PLAYER_RADIUS) {
        this.radius -= 5;
        this.fillMeter = 99;
        this.multiplier = s.roundToTenth(this.multiplier - 0.1);
      }
      else {
        this.fillMeter = 0;
      }
    }
  };


  /*
   * Move the player to coordinates specified.
   */
  s.Sponge.prototype.move = function(x, y) {
    this.centerX = x;
    this.centerY = y;

    // don't allow player off the screen or past barrier
    if(this.centerX + this.radius >= s.SCREEN_WIDTH) {
      this.centerX = s.SCREEN_WIDTH - this.radius;
    }
    if(this.centerX - this.radius <= 0) {
      this.centerX = this.radius;
    }
    if(this.centerY - this.radius <= s.BARRIER_POSITION) {
      this.centerY = s.BARRIER_POSITION + this.radius;
    }
    if(this.centerY + this.radius >= s.SCREEN_HEIGHT) {
      this.centerY = s.SCREEN_HEIGHT - this.radius;
    }
  };


  /*
   * Check if a given point is within the bounds of the circle that makes up
   * the player. Returns true or false.
   */
  s.Sponge.prototype.pointCollides = function(x, y) {
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
  s.Sponge.prototype.draw = function(context) {
    context.beginPath();
    context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = s.COLORS[this.color];
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
    context.fillStyle = s.DARK_COLORS[this.color];
    context.fill();
  };

})(window, window.sponge = window.sponge || {});
