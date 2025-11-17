class MapaJogo {
  constructor() {
    this.largura = CONFIG.MAPA.LARGURA;
    this.altura = CONFIG.MAPA.ALTURA;
  }

  desenhar() {
    // Determinar paleta do bioma atual (fallback para config do mapa)
    let fundo = CONFIG.MAPA.COR_FUNDO;
    let grade = CONFIG.MAPA.COR_GRADE;
    let destaque = [200, 160, 90];
    if (CONFIG && CONFIG.LORE && CONFIG.LORE.BIOMAS && window.biomaAtualKey) {
      const bioma = CONFIG.LORE.BIOMAS[window.biomaAtualKey];
      if (bioma && bioma.paleta) {
        // Usar floor como fundo e wall/accent para grade
        fundo = bioma.paleta.floor || fundo;
        grade = bioma.paleta.wall || grade;
        destaque = bioma.paleta.accent || destaque;
      }
    }

    background(...fundo);
    stroke(...grade);
    for (let x = 0; x < this.largura; x += CONFIG.MAPA.TAMANHO_GRADE) {
      line(x, 0, x, this.altura);
    }
    for (let y = 0; y < this.altura; y += CONFIG.MAPA.TAMANHO_GRADE) {
      line(0, y, this.largura, y);
    }

    // Props simples por bioma: marcadores decorativos (parafusos/cristais/raízes) usando destaque
    noStroke();
    fill(destaque[0], destaque[1], destaque[2], 120);
    // Densidade via configuração do usuário
    const propsConfig = localStorage.getItem('configuracoes.mapaProps') || 'med';
    let multPasso = 4, limiteRuido = 0.66;
    if (propsConfig === 'off') {
      return; // sem props
    } else if (propsConfig === 'low') {
      multPasso = 6; limiteRuido = 0.74;
    } else if (propsConfig === 'high') {
      multPasso = 3; limiteRuido = 0.60;
    }
    const passo = CONFIG.MAPA.TAMANHO_GRADE * multPasso; // props espaçadas por densidade
    for (let px = passo / 2; px < this.largura; px += passo) {
      for (let py = passo / 2; py < this.altura; py += passo) {
        // Distribuição estável via noise
        const n = noise(px * 0.01, py * 0.01);
        if (n > limiteRuido) {
          // Escolher forma simples
          const t = (n - 0.66) * 3;
          const s = 6 + (n * 6);
          if (t < 0.33) {
            ellipse(px, py, s, s);
          } else if (t < 0.66) {
            rect(px - s/2, py - s/2, s, s);
          } else {
            // triângulo simples
            triangle(px - s/2, py + s/2, px + s/2, py + s/2, px, py - s/2);
          }
        }
      }
    }
  }
}