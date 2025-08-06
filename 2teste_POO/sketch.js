let player;
let enemies = [];
let projectiles = [];
let particles = [];
camX = 0, camY = 0;
let canTransition = true;
let isInTransitionZone = false;

function setup() {
  createCanvas(800, 600);
  generateMap(); // Gera os mapas, obstáculos e zonas de transição
  player = new Player(100, 100);

  spawnEnemiesForMap(currentMap);
}

function draw() {
  background(220);

  player.update();
  updateCamera(player);
  drawMap();

  for (let enemy of enemies) {
    enemy.update();
    enemy.draw();

    if (enemy.checkPlayerCollision(player) && player.hp > 0) {
      player.hp -= 1;
      player.hp = max(0, player.hp);
    }
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].draw();
    if (!projectiles[i].active) projectiles.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].isDead()) particles.splice(i, 1);
  }

  player.draw();
  player.drawHUD();

  checkTransition();
}

function keyPressed() {
  if ((key === 'z' || key === 'Z') && player.hp > 0) {
    let proj = new Projectile(player.x + player.size / 2, player.y + player.size / 2);
    projectiles.push(proj);
  }
}

function checkTransition() {
  if (!canTransition) return;

  let zones = maps[currentMap].transitionZones;
  let playerInAnyZone = false;

  for (let zone of zones) {
    let px = player.x;
    let py = player.y;
    let pSize = player.size;

    let collidesX = px < zone.x + zone.w && px + pSize > zone.x;
    let collidesY = py < zone.y + zone.h && py + pSize > zone.y;

    if (collidesX && collidesY) {
      playerInAnyZone = true;

      if (!isInTransitionZone) {
        currentMap = zone.targetMap;
        player.x = zone.targetX;
        player.y = zone.targetY;

        updateObstacles();
        spawnEnemiesForMap(currentMap);

        canTransition = false;
        setTimeout(() => {
          canTransition = true;
        }, 500);
      }

      break;
    }
  }

  isInTransitionZone = playerInAnyZone;
}

function spawnEnemiesForMap(mapName) {
  enemies = []; // limpa inimigos

  if (mapName === 'area2') {
    enemies.push(new Enemy(400, 200));
    enemies.push(new Enemy(500, 300));
    enemies.push(new Enemy(600, 400));
  }
  // Pode adicionar inimigos para outras áreas aqui
}
