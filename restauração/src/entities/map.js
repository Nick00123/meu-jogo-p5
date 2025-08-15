class GameMap {
  constructor() {
    this.width = CONFIG.MAP.WIDTH;
    this.height = CONFIG.MAP.HEIGHT;
  }

  draw() {
    background(...CONFIG.MAP.BACKGROUND_COLOR);
    stroke(...CONFIG.MAP.GRID_COLOR);
    for (let x = 0; x < this.width; x += CONFIG.MAP.GRID_SIZE) {
      line(x, 0, x, this.height);
    }
    for (let y = 0; y < this.height; y += CONFIG.MAP.GRID_SIZE) {
      line(0, y, this.width, y);
    }
  }
}
