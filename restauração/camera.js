class Camera {
  constructor(target, mapWidth = 1600, mapHeight = 1200) {
    this.target = target;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.x = target.x;
    this.y = target.y;
    this.smoothness = 0.1; // Quanto menor, mais suave
  }

  begin() {
    // Suavização
    this.x += (this.target.x - this.x) * this.smoothness;
    this.y += (this.target.y - this.y) * this.smoothness;

    // Limitar aos limites do mapa
    let halfW = width / 2;
    let halfH = height / 2;
    this.x = constrain(this.x, halfW, this.mapWidth - halfW);
    this.y = constrain(this.y, halfH, this.mapHeight - halfH);

    translate(halfW - this.x, halfH - this.y);
  }

  end() {
    resetMatrix();
  }
}

cameraSystem = new Camera(player, gameMap.width, gameMap.height);
