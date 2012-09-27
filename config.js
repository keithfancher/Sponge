(function(window, s, undefined) {
  'use strict';

  // some useful "constants"
  s.SCREEN_WIDTH = 900;
  s.SCREEN_HEIGHT = 600;
  s.FPS = 60; // shoot for 60 fps animation
  s.COLORS = ['magenta', 'green', 'blue', 'yellow'];
  s.DARK_COLORS = ['purple', '#003300', 'darkblue', 'goldenrod'];
  s.ABSORBING_GOOD = 'white'; // player absorbing same color
  s.ABSORBING_BAD = 'red'; // player absorbing other color
  s.MIN_PLAYER_RADIUS = 5; // as small as the player can get
  s.MAX_PLAYER_RADIUS = 70; // as small as the player can get
  s.BARRIER_POSITION = s.SCREEN_HEIGHT - 150; // upper bound of player movement

})(window, window.sponge = window.sponge || {});
