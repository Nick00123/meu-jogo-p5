// ===========================================
// VARIÁVEIS GLOBAIS DO JOGO
// ===========================================

let gerenciadorEstadoJogo;
let jogador
let gerenciadorPowerUps = null;
let inimigos = [];
let projeteisInimigos = [];
let particulas = [];
let powerUps = [];
let moedas = [];
let melhorias = { SAUDE: 0, VELOCIDADE: 0 };
let aprimoramentos = [];
let sistemaCamera;
let mapaJogo;

// Pools de Objetos
let poolProjeteis;
let poolParticulas;

// Variáveis de estado do jogo
let pontuacao = 0;
let recorde = 0;
let nivel = 1;
let podeEntrarNoPortal = false;
let portalAtivadoEm = 0;
let ultimaMudancaDeNivel = 0;
let portal = { x: 1500, y: 1500, tamanho: 80 };

// NPC de Loja
let npcVendedor = { ativo: false, x: 0, y: 0, r: 38 };

// Armas
let armasDisponiveis = ['LASER', 'PISTOLA_SINALIZACAO', 'RIFLE', 'METRALHADORA'];
let indiceArmaAtual = 0;
let armaJogador;

// Sistema de Moedas e Upgrades
let moedasJogador = 0;
let totalMoedasObtidas = 0;
let upgrades = {
  SAUDE: 0,
  VELOCIDADE: 0,
  DANO: 0,
  CADENCIA: 0,
  TEMPO_RECARGA: 0,
  REGENERACAO: 0
};
let ultimoTempoRegen = 0;
let mostrarLoja = false;
let upgradeSelecionado = null;

// Novos sistemas
// progressaoArmas é criado em ProgressaoArmas.js
// dificuldadeAdaptativa é criado em Dificudade.js

// Bioma atual
window.chaveBiomaAtual = (CONFIG && CONFIG.LORE && CONFIG.LORE.PROGRESSAO) ? CONFIG.LORE.PROGRESSAO[0] : undefined;

// ===========================================
// FUNÇÕES PRINCIPAIS DO P5.JS
// ===========================================

function setup() {
  createCanvas(CONFIG.CANVAS.LARGURA, CONFIG.CANVAS.ALTURA);

  // Carregar dados salvos
  recorde = localStorage.getItem('recorde') || 0;
  UpgradeSystem.carregarUpgrades();

  // Inicializar sistemas do jogo
  gerenciadorEstadoJogo = new GerenciadorEstadoJogo();
  inicializarJogo();

  // Inicializar pools
  poolProjeteis = new PoolDeObjetos(criarProjetil, resetarProjetil);
  poolParticulas = new PoolDeObjetos(criarParticula, resetarParticula);
}

function draw() {
  if (mostrarLoja) {
    desenharLoja();
  } else {
    gerenciadorEstadoJogo.atualizar();
    gerenciadorEstadoJogo.desenhar();
  }
}

function keyPressed() {
  if (mostrarLoja) {
    if (keyCode === ESCAPE || key === 'Escape') {
      mostrarLoja = false;
    }
    return;
  }

  // Evita abrir a loja de meta-progresso se um painel do lobby estiver ativo
  if (gerenciadorEstadoJogo.obterEstadoAtual() === 'LOBBY' && gerenciadorEstadoJogo.estados.LOBBY.activePanel) {
    gerenciadorEstadoJogo.aoPressionarTecla();
    return;
  }

  gerenciadorEstadoJogo.aoPressionarTecla();
}

function mousePressed() {
  if (mostrarLoja && typeof handleShopClick === 'function') {
    handleShopClick();
  }
}

// ===========================================
// INICIALIZAÇÃO E RESET DO JOGO
// ===========================================

function resetGame() {
  if (poolProjeteis) poolProjeteis.liberarTodos();
  if (poolParticulas) poolParticulas.liberarTodos();
  inicializarJogo();
}

function reiniciarJogo() {
  resetGame();
}

function inicializarJogo() {
  if (window.runConfig) {
    const cfg = runConfig.loadRunConfig();
    runConfig.applyRunConfig(cfg);
    window.currentRunConfig = cfg;
  }

  jogador = new Jogador(CONFIG.MAPA.LARGURA / 2, CONFIG.MAPA.ALTURA / 2);

  if(!gerenciadorPowerUps) {
    gerenciadorPowerUps = new GerenciadorPowerUps();
  }
  // Seleção de personagem
  const CATALOGO_PERSONAGEM = {
    'SOLDADO': { vidaMaxima: 5, velocidade: 3, cor: [0, 200, 255] },
    'EXPLORADOR': { vidaMaxima: 4, velocidade: 3.6, cor: [0, 255, 180] },
    'TANQUE': { vidaMaxima: 7, velocidade: 2.6, cor: [0, 120, 255] }
  };
  const personagemSelecionado = localStorage.getItem('perfil.personagem') || 'SOLDADO';
  const statsPersonagem = CATALOGO_PERSONAGEM[personagemSelecionado] || CATALOGO_PERSONAGEM['SOLDADO'];
  jogador.vida = statsPersonagem.vidaMaxima;
  jogador.vidaMaxima = statsPersonagem.vidaMaxima;
  jogador.velocidade = statsPersonagem.velocidade;
  CONFIG.JOGADOR.COR = statsPersonagem.cor;

  UpgradeSystem.aplicarUpgrades();

  sistemaCamera = new Camera(jogador);
  mapaJogo = new MapaJogo();

  progressaoArmas.verificarDesbloqueioArmas(nivel, false);
  armasDisponiveis = progressaoArmas.armasDesbloqueadas;

  const armaSalva = localStorage.getItem('perfil.arma');
  const idx = armaSalva ? armasDisponiveis.indexOf(armaSalva) : -1;
  indiceArmaAtual = idx >= 0 ? idx : 0;
  armaJogador = new Arma(armasDisponiveis[indiceArmaAtual]);

  inimigos = [];
  projeteisInimigos = [];
  particulas = [];
  powerUps = [];
  moedas = [];

  pontuacao = 0;
  nivel = 1;
  podeEntrarNoPortal = false;

  npcVendedor.ativo = false;
  npcVendedor.x = 0;
  npcVendedor.y = 0;

  if (CONFIG && CONFIG.LORE && CONFIG.LORE.PROGRESSAO) {
    const prog = CONFIG.LORE.PROGRESSAO;
    window.chaveBiomaAtual = prog[0];
  }

  spawnarInimigos();
}

// ===========================================
// SISTEMA DE SPAWN DE INIMIGOS
// ===========================================

function spawnarInimigos() {
  // Se for nível de Vendedor (pré-boss), não spawnar inimigos
  if (npcVendedor && npcVendedor.ativo) {
    inimigos = [];
    podeEntrarNoPortal = true; // permitir avançar após comprar
    return;
  }
  // Verificar se é nível de boss
  if (nivel % 5 === 0 && nivel >= 5) {
    spawnarBoss();
    return;
  }
  
  // Get difficulty multiplier
  const dificuldade = dificuldadeAdaptativa.obterMultiplicadorDificuldade();
  let inimigosBase = 3 * dificuldade.taxaSpawnInimigo;
  let inimigosPorNivel = 2 * dificuldade.taxaSpawnInimigo;
  let quantidadeInimigos = Math.floor(inimigosBase + (nivel - 1) * inimigosPorNivel);
  quantidadeInimigos = max(1, quantidadeInimigos); // nunca zero em níveis normais
  
  // Escolher facções plausíveis a partir do bioma atual
  const biomaDef = (CONFIG && CONFIG.LORE && CONFIG.LORE.BIOMAS && window.chaveBiomaAtual) ? CONFIG.LORE.BIOMAS[window.chaveBiomaAtual] : null;
  const faccoesBioma = (biomaDef && biomaDef.faccoes) ? biomaDef.faccoes : ['AUTOMATONS', 'CORRUPTED_FLESH', 'LOST_EXCAVATORS'];
  
  for (let i = 0; i < quantidadeInimigos; i++) {
    let x, y;
    do {
      x = random(50, CONFIG.MAPA.LARGURA - 50);
      y = random(50, CONFIG.MAPA.ALTURA - 50);
    } while (dist(x, y, jogador.x, jogador.y) < 200);
    
    // Determinar tipo de inimigo baseado no nível
    let tipoInimigo = random();
    let inimigoSpawnado = null;
    
    // Enhanced enemy types
    if (nivel >= 5 && tipoInimigo < 0.1) {
      // Ranged enemies
      inimigoSpawnado = new InimigoAprimorado(x, y, 'ATIRADOR');
    } else if (nivel >= 4 && tipoInimigo < 0.15) {
      // Explosive enemies
      inimigoSpawnado = new InimigoAprimorado(x, y, 'EXPLOSIVO');
    } else if (nivel >= 4 && tipoInimigo < 0.2) {
      // Shielded enemies
      inimigoSpawnado = new InimigoAprimorado(x, y, 'ESCUDADO');
    } else if (nivel >= 3 && tipoInimigo < 0.25) {
      // Multiplying enemies
      inimigoSpawnado = new InimigoAprimorado(x, y, 'MULTIPLICADOR');
    } else if (nivel >= 3 && tipoInimigo < 0.3) {
      // Teleporter enemies
      inimigoSpawnado = new InimigoAprimorado(x, y, 'TELETRANSPORTADOR');
    } else if (nivel >= 2 && tipoInimigo < 0.4) {
      // Enhanced existing types
      inimigoSpawnado = new InimigoAprimorado(x, y, 'TANQUE');
    } else {
      // Normal enemies
      inimigoSpawnado = new InimigoAprimorado(x, y, 'NORMAL');
    }
    
    if (inimigoSpawnado) {
      // Anotar facção coerente com o bioma (para futuras variações visuais/comportamentais)
      const f = faccoesBioma[Math.floor(random(faccoesBioma.length))];
      inimigoSpawnado.faccao = f;
      // Aplicar perks por facção (escudos, precisão, etc.)
      aplicarPerksFaccoes(inimigoSpawnado, f);
      inimigos.push(inimigoSpawnado);
    }
  }
}

// Helpers de facções para perks temáticos
function obterDefinicaoFaccao(chaveFac) {
  return (CONFIG && CONFIG.LORE && CONFIG.LORE.FACCOES && CONFIG.LORE.FACCOES[chaveFac])
    ? CONFIG.LORE.FACCOES[chaveFac]
    : null;
}

function aplicarPerksFaccoes(inimigo, chaveFac) {
  const def = obterDefinicaoFaccao(chaveFac);
  if (!def) return;
  const perks = def.perks || [];
  // Ajustar cor básica do inimigo para refletir a facção (sutil)
  if (def.cor && Array.isArray(def.cor)) {
    inimigo.cor = def.cor;
  }
  
  // Parametrização por facção
  const pf = (CONFIG && CONFIG.PERKS && CONFIG.PERKS[chaveFac]) ? CONFIG.PERKS[chaveFac] : null;
  if (pf) {
    // Escudo cristalino
    if (pf.vidaEscudo && pf.vidaEscudo > 0) {
      inimigo.vidaEscudoMax = Math.max(inimigo.vidaEscudoMax || 0, pf.vidaEscudo);
      inimigo.vidaEscudo = Math.max(inimigo.vidaEscudo || 0, pf.vidaEscudo);
    }
    // Precisão/cadência e dano para atiradores
    if (inimigo.tipo === 'ATIRADOR' || inimigo.tipo === 'SNIPER') {
      if (pf.multiplicadorCooldownTiro) {
        inimigo.cooldownTiro = Math.max(20, Math.floor((inimigo.cooldownTiro || 60) * pf.multiplicadorCooldownTiro));
      }
      if (pf.multiplicadorDano) {
        inimigo.dano = (inimigo.dano || 10) * pf.multiplicadorDano;
      }
    }
  } else {
    // Fallback aos perks antigos por lista (compatibilidade)
    if (perks.includes('escudo_cristalino')) {
      inimigo.vidaEscudoMax = inimigo.vidaEscudoMax || 25;
      inimigo.vidaEscudo = Math.max(inimigo.vidaEscudo || 0, 25);
    }
    if (perks.includes('precision_tiro')) {
      if (inimigo.tipo === 'ATIRADOR' || inimigo.tipo === 'SNIPER') {
        inimigo.cooldownTiro = Math.max(20, Math.floor((inimigo.cooldownTiro || 60) * 0.7));
        inimigo.dano = (inimigo.dano || 10) * 1.15;
      }
    }
    if (perks.includes('tiro_perfuração')) {
      if (inimigo.tipo === 'ATIRADOR' || inimigo.tipo === 'SNIPER') {
        inimigo.dano = (inimigo.dano || 10) * 1.25;
      }
    }
  }
}

// ===========================================
// SISTEMA DE BOSS
// ===========================================

function spawnarBoss() {
  // Limpar inimigos existentes
  inimigos = [];
  
  // Criar boss em posição segura (nunca em cima do player)
  const minDist = (CONFIG && CONFIG.INIMIGO && CONFIG.INIMIGO.CHEFE && CONFIG.INIMIGO.CHEFE.DISTANCIA_MINIMA_SPAWN) ? CONFIG.INIMIGO.CHEFE.DISTANCIA_MINIMA_SPAWN : 400;
  let spawnX = CONFIG.MAPA.LARGURA / 2;
  let spawnY = CONFIG.MAPA.ALTURA / 2;
  // Se player estiver muito perto do centro, spawnar em um anel afastado
  if (dist(jogador.x, jogador.y, spawnX, spawnY) < minDist) {
    const angulo = random(TWO_PI);
    const raio = minDist + 100;
    spawnX = constrain(jogador.x + cos(angulo) * raio, 50, CONFIG.MAPA.LARGURA - 50);
    spawnY = constrain(jogador.y + sin(angulo) * raio, 50, CONFIG.MAPA.ALTURA - 50);
  }

  // Selecionar boss temático pelo bioma atual
  let nomeBoss = 'Chefe';
  let corBoss = [150, 0, 150];
  if (CONFIG && CONFIG.LORE && CONFIG.LORE.CHEFES && window.chaveBiomaAtual) {
    const chefes = CONFIG.LORE.CHEFES;
    const entradas = Object.values(chefes).filter(b => b && b.bioma === window.chaveBiomaAtual);
    if (entradas.length > 0) {
      const escolhido = random(entradas);
      nomeBoss = escolhido.nome || nomeBoss;
      // Cor sugestiva por bioma
      const biomaDef = CONFIG.LORE.BIOMAS[window.chaveBiomaAtual];
      if (biomaDef && biomaDef.paleta && biomaDef.paleta.destaque) corBoss = biomaDef.paleta.destaque;
      var chaveBossEscolhido = escolhido.chave;
    }
  }

  let boss = new ChefeInimigo(
    spawnX,
    spawnY,
    Math.floor(nivel / 5),
    chaveBossEscolhido || null
  );
  // Aplicar tema visual e nome
  boss.corTema = corBoss;
  boss.nomeExibicao = nomeBoss;
  
  inimigos.push(boss);
  
  // Notificação do boss temático
  if (window.notificacoesBoss) {
    window.notificacoesBoss.push({ texto: nomeBoss.toUpperCase(), cor: [255, 200, 0], vida: 120, x: width/2, y: height/2 });
  }
  
  // Adicionar alguns inimigos de apoio
  let quantidadeSuporte = min(3, Math.floor(nivel / 5));
  for (let i = 0; i < quantidadeSuporte; i++) {
    let angulo = (TWO_PI / quantidadeSuporte) * i;
    let distancia = 200;
    let x = CONFIG.MAPA.LARGURA / 2 + cos(angulo) * distancia;
    let y = CONFIG.MAPA.ALTURA / 2 + sin(angulo) * distancia;
    
    const e = new InimigoAprimorado(x, y, 'NORMAL');
    // Atribuir facção plausível do bioma ao suporte
    const biomaDef = (CONFIG && CONFIG.LORE && CONFIG.LORE.BIOMAS && window.chaveBiomaAtual) ? CONFIG.LORE.BIOMAS[window.chaveBiomaAtual] : null;
    const faccoesBioma = (biomaDef && biomaDef.faccoes) ? biomaDef.faccoes : ['AUTOMATONS', 'CORRUPTED_FLESH', 'LOST_EXCAVATORS'];
    const f = faccoesBioma[Math.floor(random(faccoesBioma.length))];
    e.faccao = f;
    aplicarPerksFaccoes(e, f);
    inimigos.push(e);
  }
}

// ===========================================
// SISTEMA DE NOTIFICAÇÕES DE BOSS
// ===========================================

// Array para notificações de boss
window.notificacoesBoss = [];

// Array para notificações de armas
window.notificacoesChefe = [];

function desenharNotificacoesBoss() {
  push();
  textAlign(CENTER, CENTER);
  textSize(24);
  
  for (let i = window.notificacoesBoss.length - 1; i >= 0; i--) {
    let notificacao = window.notificacoesBoss[i];
    
    // Fade out
    let alpha = map(notificacao.vida, 0, 120, 0, 255);
    fill(...notificacao.cor, alpha);
    
    text(notificacao.texto, notificacao.x, notificacao.y);
    
    notificacao.vida--;
    notificacao.y -= 1;
    
    if (notificacao.vida <= 0) {
      window.notificacoesBoss.splice(i, 1);
    }
  }
  pop();
}

function desenharNotificacoesChefe() {
  push();
  textAlign(CENTER, CENTER);
  textSize(24);
  
  for (let i = window.notificacoesChefe.length - 1; i >= 0; i--) {
    let notificacao = window.notificacoesChefe[i];
    
    // Fade out
    let alpha = map(notificacao.vida, 0, 180, 0, 255);
    fill(notificacao.cor[0], notificacao.cor[1], notificacao.cor[2], alpha);
    
    text(notificacao.texto, notificacao.x, notificacao.y);
    
    notificacao.vida--;
    notificacao.y -= 1;
    
    if (notificacao.vida <= 0) {
      window.notificacoesChefe.splice(i, 1);
    }
  }
  pop();
}

// ===========================================
// UTILITÁRIO DE LEITURA DE CONFIGURAÇÕES
// ===========================================

function obterConfiguracao(chave, valorPadrao) {
  try {
    const v = localStorage.getItem(chave);
    if (v === null || v === undefined) return valorPadrao;
    if (typeof valorPadrao === 'boolean') return v === 'true';
    return v;
  } catch (e) {
    return valorPadrao;
  }
}

// ===========================================
// PARTÍCULAS - EMISSOR GLOBAL
// ===========================================

function emitirParticulas(x, y, opts = {}) {
  if (!poolParticulas) return;
  // Defaults
  const quantidadeBase = Math.max(0, Math.floor(opts.quantidade || 10));
  const cor = Array.isArray(opts.cor) ? opts.cor : [255, 255, 255];
  const velocidadeMin = (opts.velocidade && opts.velocidade[0] !== undefined) ? opts.velocidade[0] : 1;
  const velocidadeMax = (opts.velocidade && opts.velocidade[1] !== undefined) ? opts.velocidade[1] : 3;
  const vida = (typeof opts.vida === 'number') ? opts.vida : CONFIG.PARTICULA.TEMPO_VIDA;

  // Ler densidade nas configurações
  let densidade = obterConfiguracao('configuracoes.densidadeParticula', 'med');
  let fator = 1;
  if (densidade === 'off') fator = 0;
  else if (densidade === 'low') fator = 0.5;
  else if (densidade === 'high') fator = 1.5;
  const quantidade = Math.max(0, Math.floor(quantidadeBase * fator));
  if (quantidade <= 0) return;

  for (let i = 0; i < quantidade; i++) {
    const ang = random(TWO_PI);
    const vel = random(velocidadeMin, velocidadeMax);
    const p = poolParticulas.obter();
    // Configurar propriedades
    p.x = x;
    p.y = y;
    p.vx = cos(ang) * vel;
    p.vy = sin(ang) * vel;
    p.vida = vida;
    p.tamanho = random(CONFIG.PARTICULA.TAMANHO_MIN, CONFIG.PARTICULA.TAMANHO_MAX);
    p.cor = cor;
    p.remover = false;
  }
}

// ===========================================
// FUNÇÃO DE DESENHO DO JOGO
// ===========================================

function desenharJogo() {
  // Apply camera transformation
  sistemaCamera.aplicar();

  // Draw map
  mapaJogo.desenhar();

  // Desenhar NPC da loja (se ativo)
  if (npcVendedor.ativo) {
    push();
    noStroke();
    // Corpo do NPC
    fill(120, 255, 120);
    ellipse(npcVendedor.x, npcVendedor.y, npcVendedor.r * 2);
    // Rosto simples
    fill(30, 80, 30);
    ellipse(npcVendedor.x - 8, npcVendedor.y - 5, 6);
    ellipse(npcVendedor.x + 8, npcVendedor.y - 5, 6);
    // Balão "Loja" acima
    fill(255);
    textAlign(CENTER, BOTTOM);
    textSize(12);
    text('Vendedor', npcVendedor.x, npcVendedor.y - npcVendedor.r - 6);
    // Prompt quando próximo
    const perto = dist(jogador.x, jogador.y, npcVendedor.x, npcVendedor.y) < npcVendedor.r + 40;
    if (perto) {
      fill(255, 255, 0);
      textAlign(CENTER, TOP);
      text('E: Abrir Loja', npcVendedor.x, npcVendedor.y + npcVendedor.r + 4);
    }
    pop();
  }

  // Draw portal
  if (podeEntrarNoPortal && inimigos.length === 0) {
    push();
    fill(255, 255, 0, 150 + sin(millis() * 0.01) * 50);
    noStroke();
    ellipse(portal.x, portal.y, portal.tamanho);
    fill(255, 255, 0);
    textAlign(CENTER, CENTER);
    textSize(12);
    text('PORTAL', portal.x, portal.y);
    pop();
  }

  // Draw game objects
  jogador.desenhar();
  
  for (let inimigo of inimigos) {
    inimigo.desenhar();
  }
  
  poolProjeteis.desenhar();
  poolParticulas.desenhar();
  
  for (let powerUp of powerUps) {
    powerUp.desenhar();
  }
  
  for (let moeda of moedas) {
    moeda.desenhar();
  }

  sistemaCamera.resetar(); // Reset camera transformation

  // Draw HUD (not affected by camera)
  desenharHUD();
  // Respeitar preferência para o minimapa (default: ligado)
  const mostrarMini = obterConfiguracao('configuracoes.mostrarMinimapa', true);
  if (mostrarMini) desenharMinimapa();
  desenharNotificacoesBoss();
  desenharNotificacoesChefe();

  // Desenhar moedas
for (const moeda of moedas) {
  moeda.desenhar();
}
}

// ===========================================
// ATUALIZAÇÃO DO JOGO
// ===========================================

function atualizarJogo() {
  // Update camera
  sistemaCamera.atualizar();
  
  // Update player
  jogador.atualizar();
  
  // Atualizar Power-ups
  if (gerenciadorPowerUps) gerenciadorPowerUps.atualizar(jogador);

  // Handle regeneration
  UpgradeSystem.handleRegeneracao();
  
  // Weapon switching - teclas 1, 2, 3, 4
  if (keyIsDown(49)) trocarArma(0); // '1'
  if (keyIsDown(50)) trocarArma(1); // '2'
  if (keyIsDown(51)) trocarArma(2); // '3'
  if (keyIsDown(52)) trocarArma(3); // '4'
  
  // Player shooting
  if (keyIsDown(79)) { // 'O'
    let maisProximo = encontrarInimigoMaisProximo();
    if (maisProximo) {
      armaJogador.atirar(jogador.x, jogador.y, maisProximo.x, maisProximo.y);
    }
  }
  
  // Update enemies
  for (let i = inimigos.length - 1; i >= 0; i--) {
    const inimigo = inimigos[i];
    inimigo.atualizar(jogador);
    if (inimigo.atirar) inimigo.atirar();
    // Remover se morreu por efeitos (ex.: queimadura) fora de colisão
    if (inimigo.vida <= 0) {
      // Efeito de morte por facção
      efeitoFaccaoAoMorrer(inimigo);
      // Pontos por tipo
      let valorPontuacao = obterPontuacaoInimigo(inimigo.tipo);
      pontuacao += valorPontuacao;
      // Partículas de morte
      criarParticulasAcerto(inimigo.x, inimigo.y, inimigo.config.COR);
      // Drop
      droparRecompensas(inimigo.x, inimigo.y);
      inimigos.splice(i, 1);
    }
  }
  
  poolProjeteis.atualizar();
  poolParticulas.atualizar();
  
  // Check collisions
  checarColisoes();

  
  // Clean up arrays
  powerUps = powerUps.filter(p => !p.remover);
  moedas = moedas.filter(m => !m.remover);
  
  // Desativar NPC se virar boss imediatamente (segurança)
  if (nivel % 5 === 0 && npcVendedor.ativo) {
    npcVendedor.ativo = false;
  }
  
  // Check game over
  if (jogador.vida <= 0) {
    gerenciadorEstadoJogo.mudarEstado('GAME_OVER'); // Usar a string correta do novo gerenciador
    return;
  }
  
  // Check level completion
  if (inimigos.length === 0 && !podeEntrarNoPortal) {
    podeEntrarNoPortal = true;
    portalAtivadoEm = millis();
  }
  
  // Check portal entry
  const delayAtivacao = (CONFIG && CONFIG.PORTAL && CONFIG.PORTAL.DELAY_ATIVACAO) ? CONFIG.PORTAL.DELAY_ATIVACAO : 300;
  if (
    podeEntrarNoPortal &&
    (millis() - portalAtivadoEm) >= delayAtivacao &&
    (millis() - ultimaMudancaDeNivel) >= 300 && // debounce extra de segurança
    dist(jogador.x, jogador.y, portal.x, portal.y) < portal.tamanho / 2
  ) {
    proximoNivel();
  }
}

// ===========================================
// SISTEMA DE NÍVEIS
// ===========================================

function proximoNivel() {
  nivel++;
  podeEntrarNoPortal = false;
  ultimaMudancaDeNivel = millis();

  // Atualizar bioma conforme progressão (cap por último bioma)
  if (CONFIG && CONFIG.LORE && CONFIG.LORE.PROGRESSAO) {
    const prog = CONFIG.LORE.PROGRESSAO;
    const idx = Math.min(Math.floor((nivel - 1) / CONFIG.GAMEPLAY.INTERVALO_NIVEL_CHEFE), prog.length - 1);
    window.chaveBiomaAtual = prog[idx];
  }
  
  // Check weapon unlocks
  const intervaloBoss = (CONFIG && CONFIG.GAMEPLAY && CONFIG.GAMEPLAY.INTERVALO_NIVEL_CHEFE) ? CONFIG.GAMEPLAY.INTERVALO_NIVEL_CHEFE : 5;
  const bossDerrotado = ((nivel - 1) % intervaloBoss) === 0; // chefão foi no nível anterior
  progressaoArmas.verificarDesbloqueioArmas(nivel, bossDerrotado);
  armasDisponiveis = progressaoArmas.armasDesbloqueadas;
  
  // Reset player position
  jogador.x = CONFIG.MAPA.LARGURA / 2;
  jogador.y = CONFIG.MAPA.ALTURA / 2;
  
  // Ativar/desativar NPC da loja: somente pré-boss (ex.: 4, 9, 14, ...)
  if (nivel % intervaloBoss === intervaloBoss - 1) {
    npcVendedor.ativo = true;
    const angulo = random(TWO_PI);
    const raio = 180;
    npcVendedor.x = constrain(jogador.x + cos(angulo) * raio, 80, CONFIG.MAPA.LARGURA - 80);
    npcVendedor.y = constrain(jogador.y + sin(angulo) * raio, 80, CONFIG.MAPA.ALTURA - 80);
    // Pré-boss: sem inimigos e portal liberado
    inimigos = [];
    podeEntrarNoPortal = true;
  } else {
    npcVendedor.ativo = false;
  }
  
  // Spawn new enemies
  spawnarInimigos();
  
  // Update high score
  if (pontuacao > recorde) {
    recorde = pontuacao;
    localStorage.setItem('recorde', recorde);
  }
}

// ===========================================
// INTERFACE DO USUÁRIO
// ===========================================

function desenharHUD() {
  // Opacidade configurável (default: 'med' ~ 150)
  let bgAlpha = 150;
  const op = obterConfiguracao('configuracoes.opacidadeHUD', 'med');
  if (op === 'low') bgAlpha = 100;
  else if (op === 'high') bgAlpha = 220;
  // Background for HUD
  fill(0, 0, 0, bgAlpha);
  stroke(255);
  rect(0, 0, width, 80);
  
  // Health
  fill(255, 0, 0);
  textAlign(LEFT, TOP);
  textSize(16);
  text(`Vida: ${jogador.vida}/${UpgradeSystem.getVidaMaxima()}`, 10, 10);
  
  // Score and coins
  fill(255, 255, 0);
  text(`Pontuação: ${pontuacao}`, 10, 30);
  fill(100, 255, 100);
  text(`Moedas: ${totalMoedasObtidas}`, 10, 50);
  
  // Level info
  fill(255, 255, 255);
  text(`Nível: ${nivel}`, 200, 10);
  text(`Inimigos: ${inimigos.length}`, 200, 30);
  
  // Dash cooldown indicator
  let dashCooldownRestante = max(0, CONFIG.JOGADOR.DASH.COOLDOWN - (millis() - jogador.ultimoDash));
  let dashProgresso = 1 - (dashCooldownRestante / CONFIG.JOGADOR.DASH.COOLDOWN);
  
  // Dash bar
  fill(50, 50, 50);
  rect(200, 50, 100, 8);
  fill(jogador.dashAtivo ? [0, 255, 100] : [255, 100, 0]);
  rect(200, 50, 100 * dashProgresso, 8);
  
  fill(255, 255, 255);
  textSize(12);
  text("DASH", 200, 62);
  
  // Current weapon and dash status
  fill(255, 255, 255);
  textSize(14);
  text(`Arma: ${armaJogador.tipo}`, 350, 10);
  
  if (jogador.dashAtivo) {
    fill(255, 255, 0);
    text("DASHANDO!", 350, 30);
  } else if (jogador.podeDash()) {
    fill(0, 255, 100);
    text("DASH PRONTO", 350, 30);
  } else {
    fill(255, 100, 0);
    text(`DASH: ${(dashCooldownRestante/1000).toFixed(1)}s`, 350, 30);
  }
  
  // Sistema visual de slots de armas
  let slotWidth = 40;
  let slotHeight = 25;
  let slotSpacing = 45;
  let totalWidth = (armasDisponiveis.length * slotWidth) + ((armasDisponiveis.length - 1) * slotSpacing);
  let slotX = (width - totalWidth) / 2;
  let slotY = height - 40;
  
  for (let i = 0; i < armasDisponiveis.length; i++) {
    const x = slotX + (i * slotSpacing);
    
    // Destacar o slot ativo
    if (i === indiceArmaAtual) {
      fill(255, 255, 0);
      rect(x - 2, slotY - 2, slotWidth + 4, slotHeight + 4);
    }
    
    // Fundo do slot
    fill(50, 50, 50);
    rect(x, slotY, slotWidth, slotHeight);
    
    // Número do slot
    fill(255, 255, 255);
    textSize(12);
    text(i + 1, x + 8, slotY + 16);
    
    // Indicador de arma disponível
    if (i < armasDisponiveis.length) {
      fill(0, 255, 0);
      circle(x + slotWidth - 10, slotY + 10, 8);
    }
  }
  
  // Shop hint
  fill(150, 150, 150);
  textSize(10);
  text("Aproxime-se do Vendedor (E) para abrir a loja", 350, 50);

  // Legenda opcional de facções (direita da HUD)
  const mostrarLegenda = obterConfiguracao('configuracoes.mostrarLegendaFaccoes', false);
  if (mostrarLegenda && CONFIG && CONFIG.LORE && CONFIG.LORE.BIOMAS && CONFIG.LORE.FACCOES && window.chaveBiomaAtual) {
    const bioma = CONFIG.LORE.BIOMAS[window.chaveBiomaAtual];
    const chavesFaccoes = (bioma && Array.isArray(bioma.faccoes)) ? bioma.faccoes : null;
    if (chavesFaccoes && chavesFaccoes.length) {
      const x0 = width - 260;
      const y0 = 6;
      const lineH = 16;
      const pad = 6;
      const boxW = 250;
      const boxH = pad*2 + lineH * (chavesFaccoes.length + 1);
      // fundo
      noStroke();
      fill(0, 0, 0, 140);
      rect(x0, y0, boxW, boxH, 4);
      // título
      fill(255);
      textAlign(LEFT, TOP);
      textSize(12);
      text(`Facções (${bioma.nome || window.chaveBiomaAtual})`, x0 + pad, y0 + pad);
      // linhas
      let y = y0 + pad + lineH;
      textSize(11);
      for (const fk of chavesFaccoes) {
        const fdef = CONFIG.LORE.FACCOES[fk];
        if (!fdef) continue;
        const c = fdef.cor || [200,200,200];
        // swatch
        noStroke();
        fill(c[0], c[1], c[2]);
        rect(x0 + pad, y + 3, 12, 12, 2);
        // nome
        fill(230);
        text(fdef.nome || fk, x0 + pad + 18, y);
        y += lineH;
      }
    }
  }
}

function desenharMinimapa() {
  let tamanhoMapa = 150; // Aumentado para melhor visibilidade
  let margin = 20; // Margem maior para melhor posicionamento
  let xMapa = width - tamanhoMapa - margin;
  let yMapa = margin;
  
  // Minimap background with border
  fill(0, 0, 0, 180); // Fundo mais escuro para melhor contraste
  stroke(100); // Borda mais suave
  strokeWeight(1);
  rect(xMapa - 2, yMapa - 2, tamanhoMapa + 4, tamanhoMapa + 4, 4); // Borda arredondada
  
  // Mapa interno
  fill(10, 20, 30, 200);
  noStroke();
  rect(xMapa, yMapa, tamanhoMapa, tamanhoMapa);
  
  // Calcular visão do jogo
  let viewportLeft = sistemaCamera.x - width/2;
  let viewportTop = sistemaCamera.y - height/2;
  let viewportWidth = width;
  let viewportHeight = height;
  
  // Desenhar visão do jogo no minimapa
  let viewportX = map(viewportLeft, 0, CONFIG.MAPA.LARGURA, xMapa, xMapa + tamanhoMapa);
  let viewportY = map(viewportTop, 0, CONFIG.MAPA.ALTURA, yMapa, yMapa + tamanhoMapa);
  let viewportW = map(viewportWidth, 0, CONFIG.MAPA.LARGURA, 0, tamanhoMapa);
  let viewportH = map(viewportHeight, 0, CONFIG.MAPA.ALTURA, 0, tamanhoMapa);
  
  // Desenhar elementos do jogo
  // Portal
  if (podeEntrarNoPortal) {
    fill(255, 255, 0);
    noStroke();
    let xPortalMapa = map(portal.x, 0, CONFIG.MAPA.LARGURA, xMapa, xMapa + tamanhoMapa);
    let yPortalMapa = map(portal.y, 0, CONFIG.MAPA.ALTURA, yMapa, yMapa + tamanhoMapa);
    ellipse(xPortalMapa, yPortalMapa, 6);
  }
  
  // Inimigos
  fill(255, 50, 50);
  for (let inimigo of inimigos) {
    let xInimigoMapa = map(inimigo.x, 0, CONFIG.MAPA.LARGURA, xMapa, xMapa + tamanhoMapa);
    let yInimigoMapa = map(inimigo.y, 0, CONFIG.MAPA.ALTURA, yMapa, yMapa + tamanhoMapa);
    // Só mostra inimigos que estão próximos ao jogador
    if (dist(jogador.x, jogador.y, inimigo.x, inimigo.y) < 1000) {
      ellipse(xInimigoMapa, yInimigoMapa, 3);
    }
  }
  
  // Jogador (sempre por cima)
  let xJogadorMapa = map(jogador.x, 0, CONFIG.MAPA.LARGURA, xMapa, xMapa + tamanhoMapa);
  let yJogadorMapa = map(jogador.y, 0, CONFIG.MAPA.ALTURA, yMapa, yMapa + tamanhoMapa);
  fill(0, 200, 255);
  stroke(255);
  strokeWeight(1);
  ellipse(xJogadorMapa, yJogadorMapa, 8);
  
  // Indicador de direção do jogador
  let angle = atan2(mouseY - height/2, mouseX - width/2);
  let dirX = cos(angle) * 6;
  let dirY = sin(angle) * 6;
  line(xJogadorMapa, yJogadorMapa, xJogadorMapa + dirX, yJogadorMapa + dirY);
}

// ===========================================
// FUNÇÕES DE JOGO AUSENTES
// ===========================================

function trocarArma(indiceArma) {
  if (indiceArma >= 0 && indiceArma < armasDisponiveis.length) {
    indiceArmaAtual = indiceArma;
    armaJogador = new Arma(armasDisponiveis[indiceArmaAtual]);
  }
}

function encontrarInimigoMaisProximo() {
  let maisProximo = null;
  let menorDistancia = Infinity;
  
  for (let inimigo of inimigos) {
    let d = dist(jogador.x, jogador.y, inimigo.x, inimigo.y);
    
    if (d < menorDistancia) {
      menorDistancia = d;
      maisProximo = inimigo;
    }
  }
  
  return maisProximo;
}

function obterPontuacaoInimigo(tipoInimigo) {
  const mapaPontuacao = {
    'NORMAL': 10,
    'TANQUE': 20,
    'ATIRADOR': 15,
    'SNIPER': 25,
    'EXPLOSIVO': 30,
    'ESCUDADO': 35,
    'MULTIPLICADOR': 40,
    'TELETRANSPORTADOR': 45
  };
  return mapaPontuacao[tipoInimigo] || 10;
}

function efeitoFaccaoAoMorrer(inimigo) {
  if (inimigo.faccao) {
    // Efeitos especiais baseados na facção do inimigo
    switch (inimigo.faccao) {
      case 'AUTOMATONS':
        // Efeito de faíscas/eletricidade
        emitirParticulas(inimigo.x, inimigo.y, { quantidade: 8, cor: [255, 255, 0], velocidade: 3 });
        break;
      case 'CORRUPTED_FLESH':
        // Efeito de sangue/poison
        emitirParticulas(inimigo.x, inimigo.y, { quantidade: 12, cor: [128, 0, 128], velocidade: 2 });
        break;
      case 'LOST_EXCAVATORS':
        // Efeito de terra/poeira
        emitirParticulas(inimigo.x, inimigo.y, { quantidade: 10, cor: [139, 69, 19], velocidade: 1.5 });
        break;
    }
  }
}

function criarParticulasAcerto(x, y, cor) {
  emitirParticulas(x, y, { 
    quantidade: 6, 
    cor: cor || [255, 0, 0], 
    velocidade: 2,
    tamanho: 3
  });
}

function droparRecompensas(x, y) {
  // Chance de dropar moedas
  if (random() < 0.3) {
    let moeda = new Moeda(x + random(-20, 20), y + random(-20, 20));
    moedas.push(moeda);
  }
  
  // Chance de dropar power-ups
  if (random() < 0.1) {
    let tiposPowerUp = ['SAUDE', 'VELOCIDADE', 'DANO'];
    let tipo = random(tiposPowerUp);
    let powerUp = new PowerUp(x + random(-30, 30), y + random(-30, 30), tipo);
    powerUps.push(powerUp);
  }
}

function checarColisoes() {
  // Colisões jogador-inimigo
  for (let i = inimigos.length - 1; i >= 0; i--) {
    let inimigo = inimigos[i];
    let d = dist(jogador.x, jogador.y, inimigo.x, inimigo.y);
    
    if (d < jogador.tamanho/2 + inimigo.tamanho/2) {
      // Limitar dano para 1 para todos os inimigos exceto chefes
      const danoAplicado = (inimigo.tipo === 'BOSS') ? (inimigo.dano || 1) : 1;
      jogador.vida -= danoAplicado;
      criarParticulasAcerto(jogador.x, jogador.y, [255, 0, 0]);
      
      // Knockback
      let angulo = atan2(jogador.y - inimigo.y, jogador.x - inimigo.x);
      jogador.x += cos(angulo) * 20;
      jogador.y += sin(angulo) * 20;
    }
  }
  
  // Colisões jogador-moedas
  for (let i = moedas.length - 1; i >= 0; i--) {
    const moeda = moedas[i];
    moeda.atualizar(); // Atualiza a moeda (tempo de vida, etc)

    if (moeda.verificarColisao(jogador)) {
      moedasJogador += moeda.valor;
      totalMoedasObtidas += moeda.valor;
      emitirParticulas(moeda.x, moeda.y, { cor: [255, 215, 0] });
      moedas.splice(i, 1);
    }
  }
  
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let powerUp = powerUps[i];
    let d = dist(jogador.x, jogador.y, powerUp.x, powerUp.y);
    
    if (d < jogador.tamanho/2 + powerUp.tamanho/2) {
      switch (powerUp.tipo) {
        case 'SAUDE':
          jogador.vida = min(jogador.vida + 2, jogador.vidaMaxima);
          break;
        case 'VELOCIDADE':
          jogador.velocidade += 0.5;
          break;
        case 'DANO':
          armaJogador.dano *= 1.2;
          break;
      }
      criarParticulasAcerto(powerUp.x, powerUp.y, powerUp.cor);
      powerUps.splice(i, 1);
    }
  }
  
  // Colisão projéteis do jogador com inimigos
  for (const proj of poolProjeteis.objetosAtivos) {
    if (proj.ehProjetilInimigo) continue;
    
    for (let j = inimigos.length - 1; j >= 0; j--) {
      const inimigo = inimigos[j];
      const d = dist(proj.x, proj.y, inimigo.x, inimigo.y);
      
      if (d < proj.tamanho/2 + inimigo.tamanho/2) {
        const inimigoDestruido = inimigo.receberDano(proj.dano);
        emitirParticulas(inimigo.x, inimigo.y, { cor: [255, 100, 0] });
        
        if (inimigoDestruido) {
          pontuacao += obterPontuacaoInimigo(inimigo.tipo);
          droparRecompensas(inimigo.x, inimigo.y);
          inimigos.splice(j, 1);
        }
        
        // para remover projétil da pool (provavelmente ja inativo)
        poolProjeteis.liberar(proj);
        break;
      }
    }
  }
}