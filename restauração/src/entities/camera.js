class Camera {
  constructor(target, mapWidth = CONFIG.MAP.WIDTH, mapHeight = CONFIG.MAP.HEIGHT) {
    this.target = target;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.x = target.x;
    this.y = target.y;
    this.smoothness = CONFIG.CAMERA.SMOOTHNESS;
  }

  update() {
    // Suavização
    this.x += (this.target.x - this.x) * this.smoothness;
    this.y += (this.target.y - this.y) * this.smoothness;

    // Limitar aos limites do mapa
    let halfW = CONFIG.CANVAS.WIDTH / 2;
    let halfH = CONFIG.CANVAS.HEIGHT / 2;
    this.x = constrain(this.x, halfW, this.mapWidth - halfW);
    this.y = constrain(this.y, halfH, this.mapHeight - halfH);
  }

  apply() {
    let halfW = CONFIG.CANVAS.WIDTH / 2;
    let halfH = CONFIG.CANVAS.HEIGHT / 2;
    translate(halfW - this.x, halfH - this.y);
  }

  reset() {
    resetMatrix();
  }

  // Keep old methods for backward compatibility
  begin() {
    this.update();
    this.apply();
  }

  end() {
    this.reset();
  }
}
