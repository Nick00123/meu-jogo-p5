// ===========================================
// SISTEMA DE BATALHAS ÉPICAS DE CHEFES
// ===========================================

class ChefeInimigo extends Inimigo {
  constructor(x, y, nivel = 1, chaveChefe = null) {
    super(x, y, 'BOSS');
    
    // Configurações do chefe escalonadas por nível
    this.nivel = nivel;
    this.vidaMaxima = CONFIG.INIMIGO.CHEFE.VIDA * (1 + (nivel - 1) * 0.5);
    this.vida = this.vidaMaxima;
    this.tamanho = CONFIG.INIMIGO.CHEFE.TAMANHO * (1 + nivel * 0.1);
    this.velocidade = CONFIG.INIMIGO.CHEFE.VELOCIDADE * (1 - nivel * 0.05);
    
    // Multiplicadores de escalonamento (ficam mais fortes a cada chefe)
    this.escalaDano = 1 + (nivel - 1) * 0.25;           // +25% de dano por nível
    this.escalaCooldown = 1 + (nivel - 1) * 0.10;       // -10% cooldown por nível (aplicado como divisão)
    this.escalaVelocidadeProjetil = 1 + (nivel - 1) * 0.10;  // +10% velocidade projétil por nível
    this.chaveChefe = chaveChefe;
    
    // Sistema de fases
    this.fases = 3;
    this.faseAtual = 1;
    this.limiarFasesVida = [
      this.vidaMaxima * 0.66, // Fase 2 em 66%
      this.vidaMaxima * 0.33  // Fase 3 em 33%
    ];
    
    // Sistema de ataques
    this.padroesAtaque = [];
    this.ataqueAtual = null;
    this.cooldownAtaque = 0;
    this.proximoTempoAtaque = 0;
    
    // Efeitos visuais
    this.intensidadeBrilho = 0;
    this.avisosAtaque = [];
    this.indicadoresAtaque = [];
    
    // Configurar ataques baseados na fase
    this.configurarPadroesAtaque();
    // Aplicar tunning temático por chefe (se houver)
    this.aplicarTunningChefe();
    
    // Partículas do chefe
    this.particulasChefe = [];
    this.particulasAura = [];
    
    // Estado especial
    this.enfurecido = false;
    this.limiarEnfurecer = this.vidaMaxima * 0.2;
    
    // Sistema de invulnerabilidade
    this.invulneravel = true; // invulnerável ao spawn
    this.tempoInvulneravel = 2000; // ms
    setTimeout(() => { this.invulneravel = false; }, this.tempoInvulneravel);
  }
  
  configurarPadroesAtaque() {
    // Ataques mudam conforme a fase
    this.padroesAtaque = [
      // Fase 1 - Ataques básicos
      {
        nome: "Círculo de Projéteis",
        dano: 1,
        cooldown: 2000,
        executar: () => this.ataqueCirculo(),
        fase: 1
      },
      {
        nome: "Rajada Direta",
        dano: 2,
        cooldown: 1500,
        executar: () => this.ataqueRajada(),
        fase: 1
      },
      
      // Fase 2 - Ataques intermediários
      {
        nome: "Onda de Choque",
        dano: 3,
        cooldown: 3000,
        executar: () => this.ataqueOndaChoque(),
        fase: 2
      },
      {
        nome: "Chuva de Projéteis",
        dano: 1,
        cooldown: 2500,
        executar: () => this.ataqueChuva(),
        fase: 2
      },
      
      // Fase 3 - Ataques devastadores
      {
        nome: "Laser Giratório",
        dano: 4,
        cooldown: 4000,
        executar: () => this.ataqueLaserGiratorio(),
        fase: 3
      },
      {
        nome: "Meteoro",
        dano: 5,
        cooldown: 5000,
        executar: () => this.ataqueMeteoro(),
        fase: 3
      }
    ];
  }
  
  aplicarTunningChefe() {
    if (!this.chaveChefe) return;
    // Multiplicadores leves por chefe (temáticos)
    const tunings = {
      'FORGE_WARDEN': { dano: 1.2, cooldown: 1.05, velocidadeProj: 1.1 },
      'CAVE_ENTITY': { dano: 1.1, cooldown: 1.15, velocidadeProj: 0.95 },
      'LOST_EXCAVATOR': { dano: 1.15, cooldown: 1.0, velocidadeProj: 1.2 },
      'LIVING_CORE': { dano: 1.25, cooldown: 1.1, velocidadeProj: 1.05 }
    };
    const t = tunings[this.chaveChefe];
    if (!t) return;
    this.escalaDano *= t.dano || 1;
    this.escalaCooldown *= t.cooldown || 1;
    this.escalaVelocidadeProjetil *= t.velocidadeProj || 1;
  }
  
  atualizar(jogador) {
    super.atualizar(jogador);
    
    // Atualizar fases
    this.atualizarFase();
    
    // Atualizar ataques
    this.atualizarAtaques(jogador);
    
    // Atualizar efeitos visuais
    this.atualizarEfeitosVisuais();
    
    // Verificar enfurecimento
    this.verificarEnfurecer();
    
    // Atualizar partículas
    this.atualizarParticulas();
  }
  
  atualizarFase() {
    if (this.faseAtual === 1 && this.vida <= this.limiarFasesVida[0]) {
      this.faseAtual = 2;
      this.entrarFase(2);
    } else if (this.faseAtual === 2 && this.vida <= this.limiarFasesVida[1]) {
      this.faseAtual = 3;
      this.entrarFase(3);
    }
  }
  
  entrarFase(fase) {
    // Efeito visual de transição
    this.criarEfeitoTransicaoFase();
    
    // Aumentar velocidade e dano
    this.velocidade *= 1.2;
    
    // Notificar o jogador
    this.mostrarNotificacaoFase(fase);
  }
  
  atualizarAtaques(jogador) {
    let tempoAtual = millis();
    
    if (tempoAtual > this.proximoTempoAtaque && !this.invulneravel) {
      // Selecionar ataque apropriado para a fase
      let ataquesDisponiveis = this.padroesAtaque.filter(a => a.fase <= this.faseAtual);
      
      if (ataquesDisponiveis.length > 0) {
        let ataque = random(ataquesDisponiveis);
        this.ataqueAtual = ataque;
        // Reduzir cooldown com o nível do chefe
        this.proximoTempoAtaque = tempoAtual + (ataque.cooldown / this.escalaCooldown);
        ataque.executar();
      }
    }
  }
  
  // ===== ATAQUES ESPECIAIS =====
  
  ataqueCirculo() {
    let quantidadeProjeteis = 8 + this.faseAtual * 2 + Math.max(0, Math.floor(this.nivel));
    let passoAngulo = TWO_PI / quantidadeProjeteis;
    
    for (let i = 0; i < quantidadeProjeteis; i++) {
      let angulo = i * passoAngulo;
      let vx = cos(angulo) * 5 * this.escalaVelocidadeProjetil;
      let vy = sin(angulo) * 5 * this.escalaVelocidadeProjetil;
      
      this.criarProjetilChefe(this.x, this.y, vx, vy, 1);
    }
    
    this.criarAvisoAtaque("Círculo de Projéteis!");
  }
  
  ataqueRajada() {
    // Rajada de 3 projéteis direcionados ao jogador
    let jogador = this.obterJogador();
    if (!jogador) return;
    
    let dx = jogador.x - this.x;
    let dy = jogador.y - this.y;
    let mag = sqrt(dx * dx + dy * dy);
    
    if (mag > 0) {
      for (let i = 0; i < 3; i++) {
        let vx = (dx / mag) * 6 * this.escalaVelocidadeProjetil;
        let vy = (dy / mag) * 6 * this.escalaVelocidadeProjetil;
        
        // Adicionar pequena variação
        let dispersao = 0.1;
        vx += random(-dispersao, dispersao);
        vy += random(-dispersao, dispersao);
        
        this.criarProjetilChefe(this.x, this.y, vx, vy, 2);
      }
    }
    
    this.criarAvisoAtaque("Rajada Direta!");
  }
  
  ataqueOndaChoque() {
    // Onda de choque que se expande
    let ondas = 3;
    
    for (let i = 0; i < ondas; i++) {
      setTimeout(() => {
        this.criarOndaChoque(i * 50);
      }, i * 200);
    }
    
    this.criarAvisoAtaque("Onda de Choque!");
  }
  
  ataqueChuva() {
    // Chuva de projéteis do céu
    let quantidadeChuva = 10 + this.faseAtual * 3 + Math.max(0, Math.floor(this.nivel));
    
    for (let i = 0; i < quantidadeChuva; i++) {
      setTimeout(() => {
        let x = random(0, CONFIG.MAPA.LARGURA);
        let y = -50;
        let vx = random(-1, 1) * this.escalaVelocidadeProjetil;
        let vy = (3 + random(0, 2)) * this.escalaVelocidadeProjetil;
        
        this.criarProjetilChefe(x, y, vx, vy, 1);
      }, i * 100);
    }
    
    this.criarAvisoAtaque("Chuva de Projéteis!");
  }
  
  ataqueLaserGiratorio() {
    // Laser giratório
    let duracao = 3000;
    let tempoInicio = millis();
    
    this.criarAvisoAtaque("Laser Giratório!");
    
    let intervaloLaser = setInterval(() => {
      let decorrido = millis() - tempoInicio;
      if (decorrido > duracao) {
        clearInterval(intervaloLaser);
        return;
      }
      
      let angulo = (decorrido / duracao) * TWO_PI * 2;
      let vx = cos(angulo) * 8 * this.escalaVelocidadeProjetil;
      let vy = sin(angulo) * 8 * this.escalaVelocidadeProjetil;
      
      this.criarProjetilChefe(this.x, this.y, vx, vy, 4);
    }, 50);
  }
  
  ataqueMeteoro() {
    // Meteoros caindo do céu
    let quantidadeMeteoros = 3 + this.faseAtual + Math.max(0, Math.floor(this.nivel));
    
    for (let i = 0; i < quantidadeMeteoros; i++) {
      setTimeout(() => {
        let alvoX = this.obterJogador().x + random(-100, 100);
        let alvoY = this.obterJogador().y + random(-100, 100);
        
        this.criarMeteoro(alvoX, alvoY);
      }, i * 1000);
    }
    
    this.criarAvisoAtaque("Meteoro!");
  }
  
  // ===== SISTEMA DE PROJÉTEIS DO CHEFE =====
  
  criarProjetilChefe(x, y, vx, vy, dano) {
    let projetil = poolProjeteis.obter();
    projetil.x = x;
    projetil.y = y;
    projetil.vx = vx * this.escalaVelocidadeProjetil;
    projetil.vy = vy * this.escalaVelocidadeProjetil;
    projetil.projetilInimigo = true;
    projetil.projetilChefe = true;
    projetil.tamanho = 12;
    projetil.cor = [255, 0, 255];
    projetil.dano = Math.ceil(dano * this.escalaDano);
    projetil.remover = false;
    
    // Adicionar brilho especial
    projetil.brilho = true;
  }
  
  criarOndaChoque(raio) {
    // Criar onda de choque visual
    this.avisosAtaque.push({
      x: this.x,
      y: this.y,
      raio: raio,
      raioMaximo: 200,
      vida: 60,
      dano: 3
    });
  }
  
  criarMeteoro(alvoX, alvoY) {
    // Criar meteoro que cai do céu
    let meteoro = {
      x: alvoX,
      y: -100,
      alvoX: alvoX,
      alvoY: alvoY,
      tamanho: 30,
      velocidade: 5,
      dano: 5,
      tempoAviso: 60,
      caindo: false
    };
    
    this.indicadoresAtaque.push(meteoro);
  }
  
  // ===== SISTEMA DE EFEITOS VISUAIS =====
  
  atualizarEfeitosVisuais() {
    // Atualizar intensidade do brilho
    this.intensidadeBrilho = 0.5 + 0.5 * sin(millis() * 0.005);
    
    // Atualizar avisos de ataque
    this.atualizarAvisosAtaque();
    this.atualizarIndicadoresAtaque();
  }
  
  atualizarAvisosAtaque() {
    for (let i = this.avisosAtaque.length - 1; i >= 0; i--) {
      let aviso = this.avisosAtaque[i];
      aviso.vida--;
      
      if (aviso.vida <= 0) {
        this.avisosAtaque.splice(i, 1);
      }
    }
  }
  
  atualizarIndicadoresAtaque() {
    for (let i = this.indicadoresAtaque.length - 1; i >= 0; i--) {
      let indicador = this.indicadoresAtaque[i];
      
      if (indicador.tempoAviso > 0) {
        indicador.tempoAviso--;
      } else {
        indicador.caindo = true;
        indicador.y += indicador.velocidade;
        
        if (indicador.y > indicador.alvoY) {
          // Impacto do meteoro
          this.criarImpactoMeteoro(indicador.x, indicador.y);
          this.indicadoresAtaque.splice(i, 1);
        }
      }
    }
  }
  
  criarImpactoMeteoro(x, y) {
    // Criar explosão no impacto
    for (let i = 0; i < 20; i++) {
      let angulo = random(TWO_PI);
      let velocidade = random(2, 8);
      
      let particula = poolParticulas.obter();
      particula.x = x;
      particula.y = y;
      particula.vx = cos(angulo) * velocidade;
      particula.vy = sin(angulo) * velocidade;
      particula.vida = 60;
      particula.tamanho = random(5, 15);
      particula.cor = [255, 100, 0];
      particula.remover = false;
    }
  }
  
  // ===== SISTEMA DE ENFURECIMENTO =====
  
  verificarEnfurecer() {
    if (!this.enfurecido && this.vida <= this.limiarEnfurecer) {
      this.entrarEnfurecido();
    }
  }
  
  entrarEnfurecido() {
    this.enfurecido = true;
    this.velocidade *= 1.5;
    this.criarEfeitoEnfurecido();
    this.mostrarNotificacaoEnfurecido();
  }
  
  criarEfeitoEnfurecido() {
    // Criar efeito visual de enfurecimento
    for (let i = 0; i < 50; i++) {
      let angulo = random(TWO_PI);
      let distancia = random(50, 100);
      
      let particula = poolParticulas.obter();
      particula.x = this.x + cos(angulo) * distancia;
      particula.y = this.y + sin(angulo) * distancia;
      particula.vx = cos(angulo) * 3;
      particula.vy = sin(angulo) * 3;
      particula.vida = 120;
      particula.tamanho = 8;
      particula.cor = [255, 0, 0];
      particula.remover = false;
    }
  }
  
  // ===== SISTEMA DE NOTIFICAÇÕES =====
  
  criarAvisoAtaque(texto) {
    // Adicionar notificação na tela
    this.mostrarNotificacao(texto, [255, 100, 100]);
  }
  
  mostrarNotificacaoFase(fase) {
    let texto = `FASE ${fase} - PREPARE-SE!`;
    this.mostrarNotificacao(texto, [255, 255, 0]);
  }
  
  mostrarNotificacaoEnfurecido() {
    let texto = "CHEFE ENFURECIDO! CUIDADO!";
    this.mostrarNotificacao(texto, [255, 0, 0]);
  }
  
  mostrarNotificacao(texto, cor) {
    // Criar notificação na tela
    let notificacao = {
      texto: texto,
      cor: cor,
      vida: 120,
      x: width / 2,
      y: height / 2
    };
    
    // Adicionar ao sistema de notificações
    if (window.notificacoesChefe) {
      window.notificacoesChefe.push(notificacao);
    }
  }
  
  // ===== SISTEMA DE PARTÍCULAS =====
  
  atualizarParticulas() {
    // Atualizar partículas do chefe
    this.atualizarParticulasChefe();
    this.atualizarParticulasAura();
  }
  
  atualizarParticulasChefe() {
    // Criar partículas constantes
    if (frameCount % 5 === 0) {
      let particula = poolParticulas.obter();
      particula.x = this.x + random(-this.tamanho, this.tamanho);
      particula.y = this.y + random(-this.tamanho, this.tamanho);
      particula.vx = random(-1, 1);
      particula.vy = random(-1, 1);
      particula.vida = 30;
      particula.tamanho = 3;
      particula.cor = this.enfurecido ? [255, 0, 0] : [150, 0, 150];
      particula.remover = false;
    }
  }
  
  atualizarParticulasAura() {
    // Criar aura ao redor do chefe
    if (frameCount % 2 === 0) {
      let angulo = random(TWO_PI);
      let distancia = this.tamanho + 20;
      
      let particula = poolParticulas.obter();
      particula.x = this.x + cos(angulo) * distancia;
      particula.y = this.y + sin(angulo) * distancia;
      particula.vx = cos(angulo) * 0.5;
      particula.vy = sin(angulo) * 0.5;
      particula.vida = 60;
      particula.tamanho = 2;
      particula.cor = [255, 255, 0];
      particula.remover = false;
    }
  }
  
  // ===== FUNÇÕES AUXILIARES =====
  
  obterJogador() {
    return jogador;
  }
  
  criarEfeitoTransicaoFase() {
    // Criar efeito de transição entre fases
    for (let i = 0; i < 100; i++) {
      let angulo = random(TWO_PI);
      let distancia = random(0, 200);
      
      let particula = poolParticulas.obter();
      particula.x = this.x + cos(angulo) * distancia;
      particula.y = this.y + sin(angulo) * distancia;
      particula.vx = cos(angulo) * 2;
      particula.vy = sin(angulo) * 2;
      particula.vida = 90;
      particula.tamanho = 5;
      particula.cor = [255, 255, 0];
      particula.remover = false;
    }
  }
  
  // ===== FUNÇÃO DE DESENHO APRIMORADA =====
  
  desenhar() {
    // Desenhar aura
    this.desenharAura();
    
    // Desenhar chefe com efeitos
    this.desenharChefeComEfeitos();
    
    // Desenhar avisos de ataque
    this.desenharAvisosAtaque();
    
    // Desenhar indicadores de ataque
    this.desenharIndicadoresAtaque();
    
    // Desenhar barra de vida especial
    this.desenharBarraVidaChefe();
  }
  
  desenharAura() {
    push();
    // Aura pulsante
    let tamanhoAura = this.tamanho * 2 + sin(millis() * 0.005) * 10;
    const corAura = this.corTema || [150, 0, 150];
    fill(corAura[0], corAura[1], corAura[2], 50 * this.intensidadeBrilho);
    noStroke();
    ellipse(this.x, this.y, tamanhoAura);
    
    // Segunda camada de aura
    let tamanhoAuraInterna = this.tamanho * 1.5;
    fill(255, 255, 255, 30 * this.intensidadeBrilho);
    ellipse(this.x, this.y, tamanhoAuraInterna);
    pop();
  }
  
  desenharChefeComEfeitos() {
    push();
    
    // Efeito de brilho quando enfurecido
    if (this.enfurecido) {
      drawingContext.shadowColor = "rgba(255, 0, 0, 0.8)";
      drawingContext.shadowBlur = 20;
    }
    
    // Cor baseada na fase
    let corChefe = this.enfurecido ? [255, 0, 0] : (this.corTema || [150, 0, 150]);
    fill(...corChefe);
    
    // Desenhar chefe maior que inimigos normais
    ellipse(this.x, this.y, this.tamanho);
    
    // Detalhes do chefe
    fill(255, 255, 0);
    ellipse(this.x - this.tamanho/4, this.y - this.tamanho/4, this.tamanho/4);
    ellipse(this.x + this.tamanho/4, this.y - this.tamanho/4, this.tamanho/4);
    
    // Resetar sombra
    drawingContext.shadowBlur = 0;
    pop();
  }
  
  desenharAvisosAtaque() {
    for (let aviso of this.avisosAtaque) {
      push();
      stroke(255, 0, 0, 150);
      strokeWeight(3);
      noFill();
      ellipse(this.x, this.y, aviso.raio * 2);
      pop();
    }
  }
  
  desenharIndicadoresAtaque() {
    for (let indicador of this.indicadoresAtaque) {
      if (!indicador.caindo) {
        // Aviso de meteoro
        push();
        fill(255, 0, 0, 150);
        stroke(255, 255, 0);
        strokeWeight(2);
        ellipse(indicador.x, indicador.y - 100, indicador.tamanho);
        
        fill(255, 255, 0);
        textAlign(CENTER, CENTER);
        textSize(12);
        text("!", indicador.x, indicador.y - 100);
        pop();
      }
    }
  }
  
  desenharBarraVidaChefe() {
    // Barra de vida especial do chefe
    let larguraBarra = 300;
    let alturaBarra = 20;
    let barraY = this.y - this.tamanho - 30;
    
    push();
    
    // Fundo da barra
    fill(0, 0, 0, 200);
    rect(this.x - larguraBarra/2 - 2, barraY - 2, larguraBarra + 4, alturaBarra + 4);
    
    // Barra de vida
    let percentualVida = this.vida / this.vidaMaxima;
    let corVida = this.enfurecido ? [255, 0, 0] : (this.corTema || [0, 200, 0]);
    
    fill(...corVida);
    rect(this.x - larguraBarra/2, barraY, larguraBarra * percentualVida, alturaBarra);
    
    // Borda
    noFill();
    stroke(255);
    rect(this.x - larguraBarra/2, barraY, larguraBarra, alturaBarra);
    
    // Texto
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    const textoNome = this.nomeExibicao ? `${this.nomeExibicao} - Fase ${this.faseAtual}` : `CHEFE - Fase ${this.faseAtual}`;
    text(textoNome, this.x, barraY - 15);
    
    // Indicadores de fase
    for (let i = 0; i < this.fases; i++) {
      let faseX = this.x - larguraBarra/2 + (larguraBarra / this.fases) * (i + 0.5);
      let corFase = i < this.faseAtual ? [255, 255, 0] : [100, 100, 100];
      
      fill(...corFase);
      ellipse(faseX, barraY + alturaBarra + 10, 8);
    }
    
    pop();
  }
  
  // Não receber dano durante invulnerabilidade de spawn
  receberDano(dano) {
    if (this.invulneravel) {
      return false; // não morre, não perde vida
    }
    return super.receberDano(dano);
  }
}