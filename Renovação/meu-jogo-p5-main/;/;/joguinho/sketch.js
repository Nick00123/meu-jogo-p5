// ===========================================
// VARIÁVEIS GLOBAIS DO JOGO
// ===========================================
let dadosIntro, dadosPersonagens, dadosInimigos;

const CAMINHO_DADOS = '';

let gerenciadorEstadoJogo;
let jogador
let spritesJogador;
let spritesJogadorDash;
let spritesInimigos;
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

function preload() {
  dadosIntro = loadJSON(`${CAMINHO_DADOS}intro.json`);
  dadosPersonagens = loadJSON(`${CAMINHO_DADOS}personagens.json`);
  dadosInimigos = loadJSON(`${CAMINHO_DADOS}inimigos.json`);
  
  // Carregar sprites de movimento do jogador
  spritesJogador = {
    cima: loadImage(`${CAMINHO_DADOS}movimento.png`),
    baixo: loadImage(`${CAMINHO_DADOS}movimento.png`),
    esquerda: loadImage(`${CAMINHO_DADOS}movimento.png`),
    direita: loadImage(`${CAMINHO_DADOS}movimento.png`)
  };
  
  // Carregar sprites de dash do jogador
  spritesJogadorDash = {
    cima: loadImage(`${CAMINHO_DADOS}dash.png`),
    baixo: loadImage(`${CAMINHO_DADOS}dash.png`),
    esquerda: loadImage(`${CAMINHO_DADOS}dash.png`),
    direita: loadImage(`${CAMINHO_DADOS}dash.png`)
  };

  // Carregar sprite sheet dos inimigos
  spritesInimigosSheet = loadImage(`${CAMINHO_DADOS}slimes.png`, () => {
    // Processar sprite sheet quando carregar
    processarSpritesInimigos();
  });
}

function processarSpritesInimigos() {
  console.log('Processando sprites dos inimigos...');
  console.log('spritesInimigosSheet:', spritesInimigosSheet);
  
  if (!spritesInimigosSheet) {
    console.log('Sprite sheet não carregado ainda!');
    return;
  }
  
  // Configuração do sprite sheet (ajuste conforme seu arquivo)
  const spriteWidth = 32;  // Largura de cada sprite
  const spriteHeight = 32; // Altura de cada sprite
  const cols = 4;          // Número de colunas no sprite sheet
  const rows = 2;          // Número de linhas no sprite sheet
  
  spritesInimigos = {
    vermelho: null,
    amarelo: null,
    cinza: null,
    verde: null,
    roxo: null,
    azul: null,
    laranja: null,
    ciano: null
  };
  
  // Mapear cores para posições no sprite sheet
  const mapaCores = [
    { cor: 'vermelho', col: 0, row: 0 },
    { cor: 'amarelo', col: 1, row: 0 },
    { cor: 'cinza', col: 2, row: 0 },
    { cor: 'verde', col: 3, row: 0 },
    { cor: 'roxo', col: 0, row: 1 },
    { cor: 'azul', col: 1, row: 1 },
    { cor: 'laranja', col: 2, row: 1 },
    { cor: 'ciano', col: 3, row: 1 }
  ];
  
  // Extrair sprites do sprite sheet
  for (let mapa of mapaCores) {
    const x = mapa.col * spriteWidth;
    const y = mapa.row * spriteHeight;
    
    // Criar imagem para o sprite individual
    const sprite = createImage(spriteWidth, spriteHeight);
    sprite.copy(
      spritesInimigosSheet,
      x, y, spriteWidth, spriteHeight,
      0, 0, spriteWidth, spriteHeight
    );
    
    spritesInimigos[mapa.cor] = sprite;
    console.log(`Sprite ${mapa.cor} criado`);
  }
  
  console.log('Sprites processados:', spritesInimigos);
  console.log('Chaves disponíveis:', Object.keys(spritesInimigos));
}

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
  if (!gerenciadorEstadoJogo) return; // Garante que o gerenciador foi inicializado

  if (mostrarLoja) {
    if (keyCode === ESCAPE || key === 'Escape') {
      mostrarLoja = false;
    }
    return;
  }
  // Evita abrir a loja de meta-progresso se um painel do lobby estiver ativo
  if (gerenciadorEstadoJogo.obterEstadoAtual() === 'LOBBY' && gerenciadorEstadoJogo.estados.LOBBY.activePanel) {
    gerenciadorEstadoJogo.aoPressionarTecla();
    return; // A tecla já foi tratada pelo painel do lobby
  }

  gerenciadorEstadoJogo.aoPressionarTecla();
}

function mousePressed() {
  if (mostrarLoja && gerenciadorEstadoJogo && gerenciadorEstadoJogo.obterEstadoAtual() === 'LOBBY' && typeof gerenciadorEstadoJogo.estados.LOBBY.handleShopClick === 'function') {
    gerenciadorEstadoJogo.estados.LOBBY.handleShopClick(); // Chamada corrigida
  }
}

// ===========================================
// INICIALIZAÇÃO E RESET DO JOGO
// ===========================================

function resetGame() {
  if (poolProjeteis) poolProjeteis.liberarTodos(); // Corrigido para chamar o método correto
  if (poolParticulas) poolParticulas.liberarTodos();
  inicializarJogo();
}

function reiniciarJogo() {
  resetGame();
}

function inicializarJogo() {
  if (window.runConfig) {
    const cfg = window.runConfig.carregarConfigExecucao();
    window.runConfig.aplicarConfigExecucao(cfg);
    window.currentRunConfig = cfg;
  }
  
  // Passar os sprites para a classe Inimigo
  console.log('inicializarJogo - Verificando sprites:');
  console.log('- Inimigo existe:', typeof Inimigo !== 'undefined');
  console.log('- spritesInimigos:', spritesInimigos);
  
  if (typeof Inimigo !== 'undefined' && spritesInimigos) {
    console.log('Passando sprites para classe Inimigo');
    Inimigo.setSprites(spritesInimigos);
  } else {
    console.log('AVISO: Não foi possível passar sprites para Inimigo');
  }

  jogador = new Jogador(CONFIG.MAPA.LARGURA / 2, CONFIG.MAPA.ALTURA / 2); // A classe Jogador parece estar em seu próprio arquivo

  if(!gerenciadorPowerUps) {
    gerenciadorPowerUps = new GerenciadorPowerUps();
  }
  // Seleção de personagem
  const personagemId = localStorage.getItem('perfil.personagem') || 'SOLDADO';
  const statsPersonagem = dadosPersonagens[personagemId] || dadosPersonagens['SOLDADO'];
  jogador.vida = statsPersonagem.vidaMaxima;
  jogador.vidaMaxima = statsPersonagem.vidaMaxima;
  jogador.velocidade = statsPersonagem.velocidade;
  CONFIG.JOGADOR.COR = statsPersonagem.cor;

  window.UpgradeSystem.aplicarUpgrades();

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
// SISTEMA DE NOTIFICAÇÕES DE BOSS
// ===========================================

// Array para notificações de boss
window.notificacoesBoss = [];

// Array para notificações de armas
window.notificacoesChefe = [];

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
// SISTEMA DE NÍVEIS
// ===========================================

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
  // Colisões jogador-inimigo (contato)
  for (let i = inimigos.length - 1; i >= 0; i--) {
    let inimigo = inimigos[i];
    if (!inimigo) continue;
    let d = dist(jogador.x, jogador.y, inimigo.x, inimigo.y);
    
    if (d < jogador.tamanho/2 + inimigo.tamanho/2) {
      const danoContato = (inimigo instanceof Boss) ? 5 : 1;
      jogador.receberDano(danoContato);
    }
  }
  
  // Colisões jogador-moedas
  for (let i = moedas.length - 1; i >= 0; i--) {
    const moeda = moedas[i];
    if (moeda.verificarColisao(jogador)) {
      totalMoedasObtidas += moeda.valor;
      emitirParticulas(moeda.x, moeda.y, { cor: [255, 215, 0] });
      moedas.splice(i, 1);
    }
  }
  
  // Colisões jogador-powerups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let powerUp = powerUps[i];
    if (powerUp.verificarColisao(jogador)) {
      powerUp.coletar(jogador);
      powerUps.splice(i, 1);
    }
  }
  
  // Colisão projéteis (do pool)
  for (const proj of poolProjeteis.objetosAtivos) {
    if (proj.remover) continue;

    if (proj.ehProjetilInimigo) {
      // Projétil inimigo vs Jogador
      const d = dist(proj.x, proj.y, jogador.x, jogador.y);
      if (d < proj.tamanho/2 + jogador.tamanho/2) {
        jogador.receberDano(proj.dano);
        poolProjeteis.liberar(proj);
      }
    } else {
      // Projétil do jogador vs Inimigos
      for (let j = inimigos.length - 1; j >= 0; j--) {
        const inimigo = inimigos[j];
        if (!inimigo) continue;

        const d = dist(proj.x, proj.y, inimigo.x, inimigo.y);
        if (d < proj.tamanho/2 + inimigo.tamanho/2) {
          const inimigoDestruido = inimigo.receberDano(proj.dano);
          emitirParticulas(inimigo.x, inimigo.y, { cor: [255, 100, 0] });
          
          if (inimigoDestruido) {
            if (!(inimigo instanceof Boss)) { // Não remove o chefe diretamente
              pontuacao += obterPontuacaoInimigo(inimigo.tipo);
              droparRecompensas(inimigo.x, inimigo.y);
              inimigos.splice(j, 1);
            }
          }
          
          poolProjeteis.liberar(proj);
          break; // Projétil colidiu, não precisa checar outros inimigos
        }
      }
    }
  }

  // Colisão projéteis inimigos (array legado, se ainda for usado)
  for (let i = projeteisInimigos.length - 1; i >= 0; i--) {
    const proj = projeteisInimigos[i];
    if (proj.remover) {
      projeteisInimigos.splice(i, 1);
      continue;
    }
    const d = dist(proj.x, proj.y, jogador.x, jogador.y);
    if (d < proj.tamanho / 2 + jogador.tamanho / 2) {
      jogador.receberDano(proj.dano);
      proj.remover = true;
      emitirParticulas(proj.x, proj.y, { cor: [255, 0, 0] });
    }
  }
}