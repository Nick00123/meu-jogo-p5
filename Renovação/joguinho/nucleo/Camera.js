class Camera {
  constructor(alvo = null) {
    this.alvo = alvo || null;
    this.x = 0;
    this.y = 0;
    this._pushed = false;
    this.suavizacao = (window.CONFIG && CONFIG.CAMERA && CONFIG.CAMERA.SUAVIZACAO) ? CONFIG.CAMERA.SUAVIZACAO : 0.1;
  }

  seguir(alvo) {
    this.alvo = alvo || this.alvo;
  }

  atualizar() {
    if (!this.alvo) return;
    // manter valores numéricos seguros
    const tx = (typeof this.alvo.x === 'number') ? this.alvo.x : this.x;
    const ty = (typeof this.alvo.y === 'number') ? this.alvo.y : this.y;
    this.x = lerp(this.x, tx, this.suavizacao);
    this.y = lerp(this.y, ty, this.suavizacao);
  }

  aplicar() {
    // chama push/translate para centralizar a câmera na posição calculada
    push();
    this._pushed = true;
    const cx = (typeof width === 'number') ? width / 2 : 0;
    const cy = (typeof height === 'number') ? height / 2 : 0;
    translate(cx - this.x, cy - this.y);
  }

  resetar() {
    // restaura transformações aplicadas em aplicar()
    if (this._pushed) {
      pop();
      this._pushed = false;
    }
  }
}

// expor globalmente para compatibilidade
window.Camera = window.Camera || Camera;