// some useful "constants"
var SCREEN_WIDTH = 900;
var SCREEN_HEIGHT = 600;

// some useful globals (I know, I know...)
var canvas;
var context;
var mouseX = (window.innerWidth - SCREEN_WIDTH);
var mouseY = (window.innerHeight - SCREEN_HEIGHT);
var sponge; // the player


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
 * Sets everything up: creates the canvas, creates the player, starts the game
 * loop.
 */
function init() {
  // create canvas/context
  canvas = document.getElementById('world');
  if(canvas && canvas.getContext) {
    context = canvas.getContext('2d');
  }
  else {
    // do something "real" here later...
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

  // create the player object
  sponge = new Sponge()

  // ~60 fps animation
  setInterval(loop, 1000 / 60);
}


/*
 * Callback to handle mouse movement.
 */
function documentMouseMoveHandler(event) {
  mouseX = event.clientX - (window.innerWidth - SCREEN_WIDTH) * 0.5;
  mouseY = event.clientY - (window.innerHeight - SCREEN_HEIGHT) * 0.5;
}


/*
 * Main game loop.
 */
function loop() {
  context.fillStyle = 'rgba(0,0,0,0.05)';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  sponge.move(mouseX, mouseY);
  sponge.draw()
}


// Run!
init();
