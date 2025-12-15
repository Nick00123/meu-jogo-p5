// ===========================================
// SISTEMA DE ARMAS
// ===========================================

class Arma {
  constructor(tipo) {
    this.tipo = tipo;
    // Verifica se CONFIG.ARMAS existe e tem a arma específica
    if (!CONFIG.ARMAS || !CONFIG.ARMAS[tipo]) {
      console.error(`Configuração não encontrada para a arma: ${tipo}`);
      // Fornece um objeto de configuração padrão para evitar que o jogo quebre
      this.config = { NOME: 'ARMA_PADRAO', COOLDOWN: 500, QUANTIDADE_PROJETIL: 1, VELOCIDADE_PROJETIL: 10, DANO: 10, COR: [255, 0, 0], TAMANHO_PROJETIL: 5 };
    } else {
      this.config = CONFIG.ARMAS[tipo];
    }
    this.ultimoTiro = 0;
  }
  
  podeAtirar() {
  // Se não houver configuração, não permite atirar
  if (!this.config) return false;
  // Usa o valor padrão de COOLDOWN se não estiver definido
  const cooldown = this.config.COOLDOWN || 500;
  return millis() - this.ultimoTiro > cooldown;
}
  
  atirar(x, y, alvoX, alvoY) {
    if (!this.podeAtirar()) return;
    if (typeof poolProjeteis === 'undefined' || !poolProjeteis.obter) {
      console.error("poolProjeteis não está disponível.");
      return;
    }

    this.ultimoTiro = millis();
    const cfg = this.config;
    const anguloBase = atan2(alvoY - y, alvoX - x);
    const dispersaoRad = radians(cfg.ANGULO_DISPERSAO || 0);
    const numProjeteis = cfg.QUANTIDADE_PROJETIL || 1;

    for (let i = 0; i < numProjeteis; i++) {
      // Calcula o ângulo para cada projétil, aplicando a dispersão
      let deslocamentoAngulo = (numProjeteis > 1)
        ? map(i, 0, numProjeteis - 1, -dispersaoRad / 2, dispersaoRad / 2)
        : 0;
      let anguloFinal = anguloBase + deslocamentoAngulo;

      const vx = cos(anguloFinal) * cfg.VELOCIDADE_PROJETIL;
      const vy = sin(anguloFinal) * cfg.VELOCIDADE_PROJETIL;

      let projetil = poolProjeteis.obter();
      projetil.x = x;
      projetil.y = y;
      projetil.vx = vx;
      projetil.vy = vy;
      projetil.ehProjetilInimigo = false;
      projetil.tamanho = cfg.TAMANHO_PROJETIL;
      projetil.cor = cfg.COR;
      projetil.dano = cfg.DANO; // O multiplicador de dano pode ser aplicado na colisão
      projetil.remover = false;

      // Adiciona propriedades especiais se existirem na configuração
      if (cfg.PERFURANTE) projetil.perfurante = true;
      if (cfg.FORCA_PERSEGUIR) {
        projetil.forcaTeleguiado = cfg.FORCA_PERSEGUIR;
        projetil.velocidadeBase = cfg.VELOCIDADE_PROJETIL;
      }

      // Adiciona o projétil à lista de objetos ativos para ser atualizado e desenhado
      if (poolProjeteis.ativar) poolProjeteis.ativar(projetil);
    }

    // Efeito visual de disparo
    if (typeof emitirParticulas === 'function') {
      emitirParticulas(x, y, {
        quantidade: 3 + numProjeteis,
        cor: cfg.COR,
        velocidade: [1, 3],
        vida: 25
      });
    }
  }
}

// ===========================================
// FUNÇÕES AUXILIARES DE ARMAS
// ===========================================

function encontrarInimigoMaisProximo() {
  if (!inimigos || inimigos.length === 0) return null;
  
  let maisProximo = null;
  let menorDist = Infinity;
  
  for (let inimigo of inimigos) {
    if (!inimigo || typeof inimigo.x !== 'number' || typeof inimigo.y !== 'number') continue;
    
    let d = dist(jogador.x, jogador.y, inimigo.x, inimigo.y);
    if (d < menorDist) {
      menorDist = d;
      maisProximo = inimigo;
    }
  }
  
  return maisProximo;
}