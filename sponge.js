// we like it STRICT, baby
"use strict";


// some useful "constants"
var SCREEN_WIDTH = 900;
var SCREEN_HEIGHT = 600;
var COLORS = ["red", "green", "blue", "yellow"];

// some useful globals (I know, I know...)
var canvas;
var context;
var mouseX = SCREEN_WIDTH / 2;
var mouseY = SCREEN_HEIGHT / 2;
var sponge; // the player
var lines = []; // enemies!


/*
 * The Sponge object -- essentially the "player" of the game.
 */
function Sponge() {
  this.centerX = canvas.width / 2;
  this.centerY = canvas.height / 2;
  this.radius = 20;

  // moves the player to coordinates specified
  this.move = function(x, y) {
    this.centerX = x;
    this.centerY = y;

    // don't allow player off the screen (canvas)
    if(this.centerX + this.radius >= canvas.width) {
      this.centerX = canvas.width - this.radius;
    }
    if(this.centerX - this.radius <= 0) {
      this.centerX = this.radius;
    }
    if(this.centerY - this.radius <= 0) {
      this.centerY = this.radius;
    }
    if(this.centerY + this.radius >= canvas.height) {
      this.centerY = canvas.height - this.radius;
    }
  };

  // draw the player to the canvas
  this.draw = function() {
    context.beginPath();
    context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
  };
}


/*
 * The Line object. The enemy... but also your key to embiggenment!
 */
function Line() {
  this.length = randomInt(100, 300); // length of the line
  this.origin = 0 - this.length; // a Y value, the start of the line
  this.xPos = randomInt(0, canvas.width - 1); // X position of the line
  this.speed = 2; // how fast it moves downward
  this.color = COLORS[randomInt(0, COLORS.length - 1)]; // random color

  // updates the line's position on the screen... called every frame
  this.move = function() {
    this.origin += this.speed;
  };

  // draws the line to the canvas
  this.draw = function() {
    context.beginPath();
    context.moveTo(this.xPos, this.origin);
    context.lineTo(this.xPos, this.origin + this.length);
    context.strokeStyle = this.color;
    context.lineWidth = 3;
    context.stroke();
  };
}


/*
 * Callback to handle mouse movement.
 */
function documentMouseMoveHandler(event) {
  // change document coordinates to canvas coordinates
  mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * 0.5;
  mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * 0.5;
}


/*
 * Returns random integer between min and max (inclusive!).
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


/*
 * Build an array of Line objects... the enemies!
 */
function createLines(numLines) {
  for(var i = 0; i < numLines; i++) {
    var tmpLine = new Line();
    lines.push(tmpLine);
  }
}


/*
 * Update the lines in the line array.
 */
function updateLines() {
  for(var i = 0; i < lines.length; i++) {
    lines[i].move();
  }
}


/*
 * Draw the lines in the line array.
 */
function drawLines() {
  for(var i = 0; i < lines.length; i++) {
    lines[i].draw();
  }
}


/*
 * Spawn a new enemy... maybe!
 */
function maybeSpawnNewLine() {
  // make this value variable later, more enemies will spawn as game progresses
  if(Math.random() < 0.04) {
    var tmpLine = new Line();
    lines.push(tmpLine);
  }
}


/*
 * The game loop!
 */
function loop() {
  // use alpha to create a "fade out" effect
  context.fillStyle = 'rgba(0, 0, 0, 0.2)';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  // spawn new enemies every once in a while
  maybeSpawnNewLine();

  // update player and enemies
  sponge.move(mouseX, mouseY);
  updateLines();

  // draw player and enemies
  drawLines();
  sponge.draw();
}


/*
 * Sets everything up: creates the canvas, creates the player, starts the game
 * loop.
 */
(function main() {
  // create canvas/context
  canvas = document.getElementById('world');
  if(canvas && canvas.getContext) {
    context = canvas.getContext('2d');
  }
  else {
    // do something real here later...
    alert("OH SHIT THERE'S A HORSE IN THE HOSPITAL");
  }

  // event listener(s)
  document.addEventListener('mousemove', documentMouseMoveHandler, false);

  // set up canvas
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  canvas.style.position = 'absolute';
  canvas.style.left = (window.innerWidth - SCREEN_WIDTH) * 0.5 + 'px';
  canvas.style.top = (window.innerHeight - SCREEN_HEIGHT) * 0.5 + 'px';

  // create the player and enemies
  sponge = new Sponge();
  createLines(10);

  // ~60 fps animation
  setInterval(loop, 1000 / 60);
})();
