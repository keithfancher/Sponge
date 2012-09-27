(function(window, s, undefined) {
  'use strict';

  /*
   * The Line object. The enemy... but also your key to embiggenment!
   */
  s.Line = function() {
    this.length = s.randomInt(100, 300); // length of the line
    this.origin = 0 - this.length; // a Y value, the start of the line
    this.xPos = s.randomInt(0, s.SCREEN_WIDTH - 1); // X position of the line
    this.speed = 2; // how fast it moves downward
    this.color = s.COLORS[s.randomInt(0, s.COLORS.length - 1)]; // random color
  };


  /*
   * Update the line's position on the screen... called every frame.
   */
  s.Line.prototype.move = function() {
    this.origin += this.speed;
  };


  /*
   * Draw the line to the given context.
   */
  s.Line.prototype.draw = function(context) {
    context.beginPath();
    context.moveTo(this.xPos, this.origin);
    context.lineTo(this.xPos, this.origin + this.length);
    context.strokeStyle = this.color;
    context.lineWidth = 3;
    context.stroke();
  };

})(window, window.sponge = window.sponge || {});
