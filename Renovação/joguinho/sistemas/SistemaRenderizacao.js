class SistemaRenderizacao {
  constructor() {
    this.margemRenderizacao = 100; // Margem além da tela para renderização
  }

  // Verifica se um objeto está na área visível
  estaVisivel(x, y, tamanho, camera) {
    const margem = this.margemRenderizacao + tamanho;
    return x + tamanho > -margem && 
           x - tamanho < width + margem && 
           y + tamanho > -margem && 
           y - tamanho < height + margem;
  }

  // Desenha apenas os objetos visíveis
  desenharObjetos(objetos, desenharCallback) {
    push();
    const camX = sistemaCamera ? sistemaCamera.x : 0;
    const camY = sistemaCamera ? sistemaCamera.y : 0;
    
    for (const obj of objetos) {
      if (this.estaVisivel(
        obj.x - camX + width/2, 
        obj.y - camY + height/2, 
        obj.tamanho || obj.raio || 50
      )) {
        desenharCallback(obj);
      }
    }
    pop();
  }
}