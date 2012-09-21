var SCREEN_WIDTH = 900;
var SCREEN_HEIGHT = 600;

var canvas;
var context;


function init() {
  canvas = document.getElementById('world');

  if(canvas && canvas.getContext) {
    context = canvas.getContext('2d');
  }
  else {
    alert("OH SHIT THERE'S A HORSE IN THE HOSPITAL");
  }

  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;

  canvas.style.position = 'absolute';
  canvas.style.left = (window.innerWidth - SCREEN_WIDTH) * 0.5 + 'px';
  canvas.style.top = (window.innerHeight - SCREEN_HEIGHT) * 0.5 + 'px';

  setInterval(loop, 1000 / 60);
}


function loop() {
  context.fillStyle = 'rgba(0,0,0,0.05)';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  var radius = 70;

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = 'green';
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = '#003300';
  context.stroke();
}


// run!
init();
