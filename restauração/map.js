class GameMap {
  constructor() {
    this.width = 2000;
    this.height = 2000;
  }

  draw() {
    background(30, 120, 30);
    stroke(50);
    for (let x = 0; x < this.width; x += 50) {
      line(x, 0, x, this.height);
    }
    for (let y = 0; y < this.height; y += 50) {
      line(0, y, this.width, y);
    }
  }
}
