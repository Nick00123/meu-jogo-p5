let maps = {
  area1: {
    obstacles: [],
    transitionZones: []
  },
  area2: {
    obstacles: [],
    transitionZones: []
  }
};

let obstacles = [];
let currentMap = 'area1';

function generateMaps() {
  // Área 1
  let obs1 = [];
  for (let i = 0; i < 20; i++) {
    obs1.push({ x: i * 64, y: 0, w: 64, h: 64 });
    obs1.push({ x: i * 64, y: 640, w: 64, h: 64 });
    obs1.push({ x: 0, y: i * 64, w: 64, h: 64 });
    obs1.push({ x: 1280, y: i * 64, w: 64, h: 64 });
  }
  obs1.push({ x: 300, y: 300, w: 200, h: 64 });

  maps.area1.obstacles = obs1;

  maps.area1.transitionZones = [
    { x: 600, y: 600, w: 64, h: 64, targetMap: 'area2', targetX: 100, targetY: 100 }
  ];

  // Área 2
  let obs2 = [];
  for (let i = 0; i < 15; i++) {
    obs2.push({ x: i * 64, y: 0, w: 64, h: 64 });
    obs2.push({ x: i * 64, y: 512, w: 64, h: 64 });
    obs2.push({ x: 0, y: i * 64, w: 64, h: 64 });
    obs2.push({ x: 960, y: i * 64, w: 64, h: 64 });
  }
  obs2.push({ x: 200, y: 200, w: 128, h: 64 });

  maps.area2.obstacles = obs2;

  maps.area2.transitionZones = [
    { x: 100, y: 100, w: 64, h: 64, targetMap: 'area1', targetX: 600, targetY: 600 }
  ];
}

function updateObstacles() {
  obstacles = maps[currentMap].obstacles;
}

function generateMap() {
  generateMaps();
  updateObstacles();
}

function drawMap() {
  fill(100);
  for (let obs of obstacles) {
    rect(obs.x - camX, obs.y - camY, obs.w, obs.h);
  }

  fill(255, 0, 0, 100);
  let zones = maps[currentMap].transitionZones;
  for (let zone of zones) {
    rect(zone.x - camX, zone.y - camY, zone.w, zone.h);
  }
}

function isColliding(x, y, size = 32) {
  for (let obs of obstacles) {
    let collidesX = x < obs.x + obs.w && x + size > obs.x;
    let collidesY = y < obs.y + obs.h && y + size > obs.y;

    if (collidesX && collidesY) return true;
  }

  if (x < 0 || y < 0 || x + size > 1280 || y + size > 1280) return true;

  return false;
}
