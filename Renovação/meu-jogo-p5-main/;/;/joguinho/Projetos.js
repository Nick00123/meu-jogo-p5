class Projetil {
  constructor(x, y, vx, vy, ehProjetilInimigo = false) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ehProjetilInimigo = ehProjetilInimigo;
    this.tamanho = ehProjetilInimigo ? CONFIG.PROJETIL.INIMIGO.TAMANHO : CONFIG.PROJETIL.JOGADOR.TAMANHO;
    this.cor = ehProjetilInimigo ? CONFIG.PROJETIL.INIMIGO.COR : CONFIG.PROJETIL.JOGADOR.COR;
    this.dano = 1;
    this.ehLaser = false;
    this.remover = false;
    // Opcional
    this.vida = undefined;       // frames restantes (se definido)
    this.forcaTeleguiado = 0;    // >0 ativa teleguiado
    this.velocidadeBase = undefined; // magnitude desejada do vetor velocidade
  }

  atualizar() {
    // Vida limitada
    if (typeof this.vida === 'number') {
      this.vida--;
      if (this.vida <= 0) {
        this.remover = true;
        return;
      }
    }

    // Teleguiado simples para projétil do jogador
    if (!this.ehProjetilInimigo && this.forcaTeleguiado > 0 && Array.isArray(inimigos) && inimigos.length > 0) {
      let maisProximo = null;
      let minD2 = Infinity;
      for (const e of inimigos) {
        if (!e) continue;
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < minD2) { minD2 = d2; maisProximo = e; }
      }
      if (maisProximo) {
        const dx = maisProximo.x - this.x;
        const dy = maisProximo.y - this.y;
        const mag = Math.hypot(dx, dy) || 1;
        const tx = dx / mag;
        const ty = dy / mag;
        // Interpolar em direção ao alvo
        this.vx = this.vx * (1 - this.forcaTeleguiado) + tx * (this.velocidadeBase || Math.hypot(this.vx, this.vy)) * this.forcaTeleguiado;
        this.vy = this.vy * (1 - this.forcaTeleguiado) + ty * (this.velocidadeBase || Math.hypot(this.vx, this.vy)) * this.forcaTeleguiado;
      }
    }

    this.x += this.vx;
    this.y += this.vy;
    
    // Remove se sair do mapa
    if (
      this.x < 0 || this.x > CONFIG.MAPA.LARGURA ||
      this.y < 0 || this.y > CONFIG.MAPA.ALTURA
    ) {
      this.remover = true;
    }
  }

  foraDaTela() {
    return this.remover || 
           this.x < 0 || this.x > CONFIG.MAPA.LARGURA ||
           this.y < 0 || this.y > CONFIG.MAPA.ALTURA;
  }

  desenhar() {
    noStroke();
    
    if (this.ehLaser) {
      // Efeito especial para laser
      fill(this.cor[0], this.cor[1], this.cor[2], 200);
      ellipse(this.x, this.y, this.tamanho + 2);
      fill(this.cor[0], this.cor[1], this.cor[2], 255);
      ellipse(this.x, this.y, this.tamanho);
      
      // Efeito de brilho
      fill(255, 255, 255, 100);
      ellipse(this.x, this.y, this.tamanho / 2);
    } else {
      // Projétil normal
      fill(this.cor[0], this.cor[1], this.cor[2]);
      ellipse(this.x, this.y, this.tamanho);
    }
  }
}