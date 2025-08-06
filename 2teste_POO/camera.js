let camX = 0;
let camY = 0;

function updateCamera(player) {
  camX = player.x - width / 2;
  camY = player.y - height / 2;

  camX = constrain(camX, 0, 1280 - width);
  camY = constrain(camY, 0, 1280 - height);
}
