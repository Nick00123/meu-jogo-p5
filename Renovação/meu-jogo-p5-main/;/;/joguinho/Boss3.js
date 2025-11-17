class Boss3 extends Boss {
  constructor(x, y) {
    // Parâmetros para a classe Boss: x, y, size, health, speed
    super(x, y, 80, 2000, 2.5); // Velocidade reduzida para 2.5

    this.maxHealth = this.health; // Inicializa maxHealth para a barra de vida funcionar
    // Atributos específicos que não estão na classe Boss
    this.damage = 2; // DANO DE CONTATO PADRÃO (2 corações). Isso corrige o hitkill.
    this.r = 40; // Usando 'r' para raio, para consistência
    this.cor = color(150, 0, 0);

    // Estado do Boss: 'idle', 'attacking', 'charging', 'dashing', 'teleporting', 'teleport_warning', 'scream_charging', 'scream_attacking'
    this.estado = 'idle';
    this.attackCooldown = 1200; // Cooldown reduzido para 1200ms (40% mais rápido)
    this.lastAttackTime = millis();

    // --- Ataque 4: Grito Sônico (quando vida <= 10%) ---
    this.screamChargeTime = 2000; // 2 segundos carregando
    this.screamChargeStart = 0;
    this.screamDamage = 3; // Dano alto do grito
    this.screamRadius = 400; // Raio do grito sônico
    this.screamSpeed = 8; // Velocidade de expansão da onda
    this.screamActive = false;
    this.screamWaves = []; // Array para ondas de choque

    // --- Ataque 1: Tiros de Bolas Vermelhas ---
    this.fireRate = 120; // Tempo entre disparos reduzido para 120ms (40% mais rápido)
    this.ballSpeed = 10; // Velocidade das bolas aumentada para 10 (43% mais rápido)
    this.ballSize = 18; // Bolas ligeiramente maiores
    this.damageBall = 2; // Dano das bolas aumentado para 2 corações (100% mais dano)
    this.numBalls = 8; // Número de bolas aumentado para 8 (60% mais projéteis)
    this.ballsFired = 0;
    this.lastFireTime = 0;

    // --- Ataque 2: Investida Carregada ---
    this.chargeTime = 1500; // Tempo de carregamento reduzido para 1500ms (25% mais rápido)
    this.dashSpeed = 35; // Velocidade da investida aumentada para 35 (40% mais rápido)
    this.dashDistance = 1000; // Distância da investida aumentada para 1000 (25% mais longa)
    this.damageDash = 6; // Dano da investida aumentado para 6 corações (50% mais dano)
    this.lineColor = color(255, 0, 0, 150);
    this.chargeStartTime = 0;
    this.dashTarget = null;
    this.dashOrigin = null;

    // --- Ataque 3: Teletransporte ---
    this.teleportDistance = 400; // Distância mínima reduzida para 400 (teleporta mais cedo)
    this.teleportOffset = 100;   // Surge mais perto do jogador (33% mais próximo)
    this.teleportCooldown = 5000; // Cooldown reduzido para 5000ms (37.5% mais frequente)
    this.lastTeleportTime = -this.teleportCooldown; // Permite teleporte no início se necessário
    
    // --- Efeito de Fumaça Vermelha ---
    this.teleportWarningTime = 1500; // 1,5 segundos de aviso
    this.teleportWarningStart = 0;
    this.smokeParticles = []; // Array para partículas de fumaça
  }

  // Sobrescreve o método update da classe Boss
  update(player = window.jogador, walls = []) {
    // Salva o jogador para uso nos métodos internos
    this.currentPlayer = player;
    
    // Chama os métodos manualmente já que a classe pai não tem parâmetros
    this.updatePhase();
    this.move(player);
    this.handleAttacks();
  }

  // Sobrescreve o método de movimento da classe Boss para remover o redutor de 0.5.
  move(player) {
    // Não se move enquanto está carregando ou dando a investida
    if (this.estado === 'charging' || this.estado === 'dashing') return;

    let angle = atan2(player.y - this.y, player.x - this.x);
    this.x += cos(angle) * this.speed;
    this.y += sin(angle) * this.speed;

    // Limita o boss dentro dos limites do mapa
    this.x = constrain(this.x, this.r, CONFIG.MAPA.LARGURA - this.r);
    this.y = constrain(this.y, this.r, CONFIG.MAPA.ALTURA - this.r);
  }

  // Sobrescreve o manipulador de ataques da classe Boss.
  // Esta função agora centraliza TODA a lógica de decisão e execução de ataques.
  handleAttacks() {
    const player = this.currentPlayer || window.jogador;
    const distancia = dist(this.x, this.y, player.x, player.y);

    // A máquina de estados agora vive dentro do handleAttacks.
    switch (this.estado) {
      case 'idle':
        // Se o cooldown do ataque acabou, decide o próximo ataque
        if (millis() - this.lastAttackTime > this.attackCooldown) {
          this.decideNextAttack(player, distancia);
        }
        break;
      case 'attacking':
        this.handleAttackingState(player);
        break;
      case 'charging':
        this.handleChargingState(player);
        break;
      case 'dashing':
        this.handleDashingState(player, []); // Passa um array vazio de paredes por enquanto
        break;
      case 'teleport_warning':
        this.handleTeleportWarningState(player);
        break;
      case 'teleporting':
        // O teleporte é quase instantâneo, então ele volta para 'idle'
        this.estado = 'idle';
        break;
    }

    // Condição para teletransporte
    if (this.estado === 'idle' && distancia > this.teleportDistance && millis() - this.lastTeleportTime > this.teleportCooldown) {
      this.iniciarTeleporteComAviso(player);
    }
  }

  // Escolhe o próximo ataque com base na distância e aleatoriedade
  decideNextAttack(player, distancia) {
    const chance = random();

    // Se o jogador está perto ou parado, chance muito maior de investida
    if (distancia < 300 && chance < 0.8) {
      this.iniciarInvestida(player);
    } 
    // Distância média, ataque com bolas com chance aumentada
    else if (distancia >= 300 && distancia <= 600 && chance < 0.85) {
      this.iniciarAtaqueBolas(player);
    } 
    // Ataque aleatório com preferência por investida
    else {
      if (random() > 0.3) {
        this.iniciarInvestida(player);
      } else {
        this.iniciarAtaqueBolas(player);
      }
    }
  }

  // --- Lógica do Ataque de Bolas Vermelhas ---
  iniciarAtaqueBolas(player) {
    this.estado = 'attacking';
    this.ballsFired = 0;
    this.lastFireTime = millis(); // Inicia o primeiro disparo imediatamente
    this.atirarBolas(player); // Atira a primeira bola
  }

  handleAttackingState(player) {
    if (millis() - this.lastFireTime > this.fireRate && this.ballsFired < this.numBalls) {
      this.atirarBolas(player);
    }

    // Se todas as bolas foram disparadas, encerra o ataque
    if (this.ballsFired >= this.numBalls) {
      this.estado = 'idle';
      this.lastAttackTime = millis();
    }
  }

  atirarBolas(player) {
    const angulo = atan2(player.y - this.y, player.x - this.x);
    
    // Usa o pool de projéteis para eficiência
    let p = poolProjeteis.obter();
    if (p) {
      p.x = this.x;
      p.y = this.y;
      p.vx = cos(angulo) * this.ballSpeed;
      p.vy = sin(angulo) * this.ballSpeed;
      p.dano = this.damageBall;
      p.tamanho = this.ballSize * 2;
      p.cor = [255, 0, 0];
      p.ehProjetilInimigo = true;
    }
    
    this.ballsFired++;
    this.lastFireTime = millis();
  }

  // --- Lógica do Ataque de Investida ---
  iniciarInvestida(player) {
    this.estado = 'charging';
    this.chargeStartTime = millis();
    this.dashOrigin = createVector(this.x, this.y);
    const angulo = atan2(player.y - this.y, player.x - this.x);
    this.dashTarget = createVector(this.x + cos(angulo) * this.dashDistance, this.y + sin(angulo) * this.dashDistance);
  }

  handleChargingState(player) {
    // Mantém a mira no jogador durante o carregamento
    const angulo = atan2(player.y - this.y, player.x - this.x);
    this.dashTarget = createVector(this.x + cos(angulo) * this.dashDistance, this.y + sin(angulo) * this.dashDistance);

    if (millis() - this.chargeStartTime > this.chargeTime) {
      this.estado = 'dashing';
    }
  }

  handleDashingState(player, walls) {
    const angulo = atan2(this.dashTarget.y - this.y, this.dashTarget.x - this.x);
    this.x += cos(angulo) * this.dashSpeed;
    this.y += sin(angulo) * this.dashSpeed;
    const distanciaPercorrida = dist(this.dashOrigin.x, this.dashOrigin.y, this.x, this.y);

    // Condições de parada da investida
    if (distanciaPercorrida >= this.dashDistance) {
      this.pararInvestida();
    } 

    // Colisão com paredes (simplificado)
    // Uma lógica mais robusta pode ser necessária dependendo do seu sistema de colisão
    if (this.x < 0 || this.x > CONFIG.MAPA.LARGURA || this.y < 0 || this.y > CONFIG.MAPA.ALTURA) {
        this.pararInvestida();
    }
    
    // Colisão com o jogador é tratada no sistema de colisão principal,
    // mas podemos adicionar uma verificação aqui também.
    if (dist(this.x, this.y, player.x, player.y) < this.r + player.tamanho / 2) {
        player.receberDano(this.damageDash);
        this.pararInvestida();
    }
  }

  pararInvestida() {
    this.estado = 'idle';
    this.lastAttackTime = millis();
  }

  // --- Lógica do Teletransporte com Aviso ---
  iniciarTeleporteComAviso(player) {
    this.estado = 'teleport_warning';
    this.teleportWarningStart = millis();
    this.lastTeleportTime = millis();
    this.lastAttackTime = millis();
    
    // Inicia as partículas de fumaça
    this.criarFumaçaVermelha();
  }
  
  handleTeleportWarningState(player) {
    // Atualiza as partículas de fumaça
    this.atualizarFumaça();
    
    // Verifica se passou o tempo de aviso
    if (millis() - this.teleportWarningStart >= this.teleportWarningTime) {
      this.executarTeleporte(player);
    }
  }
  
  teletransporte(player) {
    this.executarTeleporte(player);
  }
  
  executarTeleporte(player) {
    this.estado = 'teleporting';

    // Efeito visual de desaparecimento (ex: partículas)
    // particleSystem.emit(this.pos.x, this.pos.y, 20);

    // Calcula uma nova posição atrás ou ao lado do jogador
    const anguloAleatorio = random(TWO_PI);
    const novaPosX = player.x + cos(anguloAleatorio) * this.teleportOffset;
    const novaPosY = player.y + sin(anguloAleatorio) * this.teleportOffset;

    // Garante que a nova posição está dentro dos limites do mapa
    this.x = constrain(novaPosX, this.r, CONFIG.MAPA.LARGURA - this.r);
    this.y = constrain(novaPosY, this.r, CONFIG.MAPA.ALTURA - this.r);

    // Efeito visual de aparecimento
    // particleSystem.emit(this.pos.x, this.pos.y, 20);
  }
  
  // --- Sistema de Partículas de Fumaça Vermelha ---
  criarFumaçaVermelha() {
    this.smokeParticles = [];
    for (let i = 0; i < 30; i++) {
      this.smokeParticles.push({
        x: this.x + random(-20, 20),
        y: this.y + random(-20, 20),
        vx: random(-1, 1),
        vy: random(-2, -0.5),
        size: random(15, 30),
        alpha: 200,
        life: 255
      });
    }
  }
  
  atualizarFumaça() {
    // Adiciona novas partículas periodicamente
    if (frameCount % 3 === 0) {
      for (let i = 0; i < 3; i++) {
        this.smokeParticles.push({
          x: this.x + random(-20, 20),
          y: this.y + random(-20, 20),
          vx: random(-1, 1),
          vy: random(-2, -0.5),
          size: random(15, 30),
          alpha: 200,
          life: 255
        });
      }
    }
    
    // Atualiza partículas existentes
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      let p = this.smokeParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 3;
      p.alpha = p.life * 0.8;
      p.size *= 1.02;
      
      // Remove partículas mortas
      if (p.life <= 0) {
        this.smokeParticles.splice(i, 1);
      }
    }
  }
  
  desenharFumaça() {
    push();
    noStroke();
    for (let p of this.smokeParticles) {
      fill(255, 50, 50, p.alpha);
      ellipse(p.x, p.y, p.size);
    }
    pop();
  }

  // Desenha o boss e elementos adicionais como a linha de investida
  display() { // O método de desenho na classe Boss é 'display'
    push();
    translate(this.x, this.y);
    fill(this.cor);
    noStroke();
    ellipse(0, 0, this.r * 2, this.r * 2);

    // Animação de "carregando"
    if (this.estado === 'charging') {
      const progresso = (millis() - this.chargeStartTime) / this.chargeTime;
      const tamanhoAnimacao = this.r * (1 + progresso * 0.5);
      fill(255, 100, 100, 100);
      ellipse(0, 0, tamanhoAnimacao * 2, tamanhoAnimacao * 2);
    }
    pop();

    // Desenha a linha indicadora da investida
    if (this.estado === 'charging') {
      push();
      stroke(this.lineColor);
      strokeWeight(4);
      line(this.x, this.y, this.dashTarget.x, this.dashTarget.y);
      pop();
    }

    // Desenha a fumaça vermelha durante o aviso de teleporte
    if (this.estado === 'teleport_warning') {
      this.desenharFumaça();
    }
    
    // Desenha a barra de vida (se não for gerenciada por outra classe)
    this.drawHealthBar();
  }
  
  // Exemplo de barra de vida
  drawHealthBar() {
      const healthBarWidth = this.r * 2;
      const healthBarHeight = 10;
      const x = this.x - this.r;
      const y = this.y - this.r - 20;
      
      const vidaPercentual = this.health / this.maxHealth;
      
      fill(50);
      rect(x, y, healthBarWidth, healthBarHeight);
      fill(255, 0, 0);
      rect(x, y, healthBarWidth * vidaPercentual, healthBarHeight);
  }
}