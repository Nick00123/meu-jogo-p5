class MapaJogo {
  constructor() {
    this.largura = (window.CONFIG && CONFIG.MAPA && CONFIG.MAPA.WIDTH) ? CONFIG.MAPA.WIDTH : 2000;
    this.altura  = (window.CONFIG && CONFIG.MAPA && CONFIG.MAPA.HEIGHT)  ? CONFIG.MAPA.HEIGHT  : 2000;
    this.corFundo = (window.CONFIG && CONFIG.MAPA && CONFIG.MAPA.BACKGROUND_COLOR) ? CONFIG.MAPA.BACKGROUND_COLOR : [30,120,30];
  }

 // Em Mapa.js, modifique o método desenhar() para:
desenhar() {
  // Fundo
  push();
  noStroke();
  const c = this.corFundo;
  fill(c[0], c[1], c[2]);
  rect(0, 0, this.largura, this.altura);
  pop();

  // Grid mais visível
  push();
  stroke(0, 100); // Aumentei a opacidade para 100
  strokeWeight(1);
  const tamanhoCelula = 50;
  
  // Linhas verticais
  for (let x = 0; x <= this.largura; x += tamanhoCelula) {
    line(x, 0, x, this.altura);
  }
  
  // Linhas horizontais
  for (let y = 0; y <= this.altura; y += tamanhoCelula) {
    line(0, y, this.largura, y);
  }
  pop();
  
  // Bordas do mapa
  push();
  noFill();
  stroke(255, 0, 0); // Borda vermelha para melhor visualização
  strokeWeight(5);
  rect(0, 0, this.largura, this.altura);
  pop();
}
}

window.MapaJogo = window.MapaJogo || MapaJogo;