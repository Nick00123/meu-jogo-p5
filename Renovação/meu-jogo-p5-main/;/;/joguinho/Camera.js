class Camera {
  constructor(alvo, larguraMapa = CONFIG.MAPA.LARGURA, alturaMapa = CONFIG.MAPA.ALTURA) {
    this.alvo = alvo;
    this.larguraMapa = larguraMapa;
    this.alturaMapa = alturaMapa;
    this.x = alvo.x;
    this.y = alvo.y;
    this.suavizacao = CONFIG.CAMERA.SUAVIZACAO;
  }

  atualizar() {
    // Suavização
    this.x += (this.alvo.x - this.x) * this.suavizacao;
    this.y += (this.alvo.y - this.y) * this.suavizacao;

    // Limitar aos limites do mapa
    let metadeLargura = CONFIG.CANVAS.LARGURA / 2;
    let metadeAltura = CONFIG.CANVAS.ALTURA / 2;
    this.x = constrain(this.x, metadeLargura, this.larguraMapa - metadeLargura);
    this.y = constrain(this.y, metadeAltura, this.alturaMapa - metadeAltura);
  }

  aplicar() {
    let metadeLargura = CONFIG.CANVAS.LARGURA / 2;
    let metadeAltura = CONFIG.CANVAS.ALTURA / 2;
    translate(metadeLargura - this.x, metadeAltura - this.y);
  }

  resetar() {
    resetMatrix();
  }

  // Métodos antigos para compatibilidade retroativa
  iniciar() {
    this.atualizar();
    this.aplicar();
  }

  finalizar() {
    this.resetar();
  }
}