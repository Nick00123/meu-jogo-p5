// ===========================================
// VARIÁVEIS GLOBAIS DO JOGO
// ===========================================

// Controle de FPS
let ultimoTempo = 0;
const FPS_ALVO = 60;
const TEMPO_ENTRE_FRAMES = 1000 / FPS_ALVO;

let dadosPersonagens, dadosInimigos;

const CAMINHO_DADOS = 'assets/dados/';

// Variáveis para as imagens da Intro
let imagensIntro;
let imagensPersonagens;
let gerenciadorEstadoJogo;

let jogador;
let spritesJogador;
let spritesJogadorDash;
let spritesInimigos;
let spritesheetInimigos;
let gerenciadorPowerUps;
let sistemaRenderizacao;
let sistemaColisao;
let inimigos = [];
let projeteisInimigos = [];
let moedas = [];
let sistemaCamera;
let mapaJogo;

// Pools de Objetos
let poolProjeteis;
let poolParticulas;

// Variáveis de estado do jogo
let pontuacao = 0;
let recorde = 0;
let nivel = 1;
let portalAberto = false;
let portalAtivadoEm;
let ultimaMudancaNivel = 0;
let portal = { x: 1500, y: 1500, tamanho: 80 };

// NPC Vendedor
let npcVendedor = { ativo: false, x: 0, y: 0, r: 38 };

// Arma do jogador (agora definida diretamente, sem lista)
let armaJogador;
// Sistema de Moedas e Melhorias
let moedasJogador = 0;
let mostrarLoja = false;

// Sistemas (IMPORTANTE: NÃO DECLARE dificuldadeAdaptativa aqui se já foi declarada em outro arquivo)
let progressaoArmas;
let sistemaMelhorias;
// let dificuldadeAdaptativa; // ← COMENTADO: será inicializado em setup(), não declarado aqui

// Bioma atual
window.chaveBiomaAtual = (CONFIG && CONFIG.LORE && CONFIG.LORE.PROGRESSAO) ? CONFIG.LORE.PROGRESSAO[0] : undefined;

// ===========================================
// FUNÇÕES PRINCIPAIS DO P5.JS
// ===========================================

function preload() {
  dadosIntro = loadJSON(`${CAMINHO_DADOS}intro.json`);
  dadosPersonagens = loadJSON(`${CAMINHO_DADOS}personagens.json`);
  dadosInimigos = loadJSON(`${CAMINHO_DADOS}inimigos.json`);

  // Carregar imagens da introdução
  imagensIntro = {
    mundoMagico: loadImage("assets/imagens/mundoMagico.png"),
    tresExploradores: loadImage("assets/imagens/tresExploradores.png"),
    MapaMistico: loadImage("assets/imagens/MapaMistico.webp"),
    jornada: loadImage("assets/imagens/jornada.png"),
    EntradaCaverna: loadImage("assets/imagens/EntradaCaverna.png"),
    Criaturas: loadImage("assets/imagens/Criaturas.webp"),
    puzzleCaverna: loadImage("assets/imagens/puzzleCaverna.png"),
    chefeFinal: loadImage("assets/imagens/chefeFinal.png")
  };

  // Carregar imagens dos personagens para a tela de seleção
  imagensPersonagens = {
    arlen: loadImage("assets/imagens/Arlen.png"),
    kael: loadImage("assets/imagens/Kael.png"),
    lyra: loadImage("assets/imagens/Lyra.png")
  };
  
  // Carregar sprites de movimento do jogador (fallback para evitar erro se imagem faltar)
  const imgMovimento = loadImage('assets/imagens/movimento.png');
  spritesJogador = { cima: imgMovimento, baixo: imgMovimento, esquerda: imgMovimento, direita: imgMovimento };
  
  const imgDash = loadImage('assets/imagens/dash.png');
  spritesJogadorDash = { cima: imgDash, baixo: imgDash, esquerda: imgDash, direita: imgDash };

  // Carregar sprite sheet dos inimigos
  spritesheetInimigos = loadImage(`assets/imagens/slimes.png`, () => {
    processarSpritesInimigos();
  }, () => { /* se não carregar, apenas ignore */ });
}

function processarSpritesInimigos() {
  if (!spritesheetInimigos) return;
  
  const larguraSheet = spritesheetInimigos.width;
  const alturaSheet = spritesheetInimigos.height;
  const larguraSprite = Math.floor(larguraSheet / 4);
  const alturaSprite = Math.floor(alturaSheet / 2);

  spritesInimigos = {
    vermelho: null, amarelo: null, cinza: null, verde: null,
    roxo: null, azul: null, laranja: null, ciano: null
  };

  const mapaCores = [
    { cor: 'vermelho', col: 0, lin: 0 }, { cor: 'amarelo', col: 1, lin: 0 },
    { cor: 'cinza', col: 2, lin: 0 },    { cor: 'verde', col: 3, lin: 0 },
    { cor: 'roxo', col: 0, lin: 1 },     { cor: 'azul', col: 1, lin: 1 },
    { cor: 'laranja', col: 2, lin: 1 },  { cor: 'ciano', col: 3, lin: 1 }
  ];

  for (let mapa of mapaCores) {
    const x = mapa.col * larguraSprite;
    const y = mapa.lin * alturaSprite;

    const sprite = createImage(larguraSprite, alturaSprite);
    sprite.copy(
      spritesheetInimigos,
      x, y, larguraSprite, alturaSprite,
      0, 0, larguraSprite, alturaSprite
    );

    spritesInimigos[mapa.cor] = sprite;
  }

  if (typeof Inimigo !== 'undefined' && typeof Inimigo.definirSprites === 'function') {
    Inimigo.definirSprites(spritesInimigos);
  }
}

// ===========================================
// SETUP (único, sem duplicações)
// ===========================================
function setup() {
  const w = (window.CONFIG && CONFIG.CANVAS && CONFIG.CANVAS.LARGURA) ? CONFIG.CANVAS.LARGURA : 800;
  const h = (window.CONFIG && CONFIG.CANVAS && CONFIG.CANVAS.ALTURA) ? CONFIG.CANVAS.ALTURA : 600;
  createCanvas(w, h);

  // Inicializa sistemas
  sistemaRenderizacao = new SistemaRenderizacao();
  sistemaColisao = new SistemaColisao();

  recorde = Number(localStorage.getItem('recorde') || 0);
  
  sistemaMelhorias = (typeof SistemaMelhorias !== 'undefined') ? new SistemaMelhorias() : null;
  if (sistemaMelhorias && typeof sistemaMelhorias.carregarMelhorias === 'function') sistemaMelhorias.carregarMelhorias();

  progressaoArmas = (typeof ProgressaoArmas !== 'undefined') ? new ProgressaoArmas() : null;
  
  // IMPORTANTE: Aqui sim, atribuir o valor (não declarar)
  if (typeof Dificuldade !== 'undefined' && typeof dificuldadeAdaptativa === 'undefined') {
    dificuldadeAdaptativa = new Dificuldade();
  }
  
  gerenciadorPowerUps = (typeof GerenciadorPowerUps !== 'undefined') ? new GerenciadorPowerUps() : null;

  if (typeof GerenciadorEstados !== 'undefined') {
    gerenciadorEstadoJogo = new GerenciadorEstados();
    gerenciadorEstados = gerenciadorEstadoJogo;
  } else {
    console.error('GerenciadorEstados não encontrado. Verifique nucleo/GerenciadorEstados.js');
  }

  poolProjeteis = (typeof PoolDeObjetos !== 'undefined') ? new PoolDeObjetos(() => ({})) : 
    (typeof ObjectPool !== 'undefined' ? new ObjectPool(() => ({})) : null);
  poolParticulas = (typeof PoolDeObjetos !== 'undefined') ? new PoolDeObjetos(() => ({})) : (typeof ObjectPool !== 'undefined' ? new ObjectPool(() => ({})) : null);

  inicializarJogo();
}

// ===========================================
// LOOP PRINCIPAL
// ===========================================
function draw() {
  const agora = millis();
  const deltaTime = agora - ultimoTempo;

  // Controle de FPS
  if (deltaTime < TEMPO_ENTRE_FRAMES) {
    return;
  }

  ultimoTempo = agora - (deltaTime % TEMPO_ENTRE_FRAMES);

  // Atualiza lógica do jogo
  if (gerenciadorEstadoJogo?.atualizar) {
    gerenciadorEstadoJogo.atualizar();
  }

  // Renderização
  if (gerenciadorEstadoJogo?.desenhar) {
    gerenciadorEstadoJogo.desenhar();
  }

  // Debug: Mostrar FPS
  fill(255);
  text(`FPS: ${Math.round(frameRate())}`, 10, 20);
}

/**
 * Desenha a interface da loja quando a flag `mostrarLoja` está ativa.
 */
function desenharLoja() {
  push();
  background(20, 20, 40, 220);

  // Título da Loja
  fill(255, 215, 0);
  textAlign(CENTER, CENTER);
  textSize(32);
  text("LOJA DE MELHORIAS", width / 2, 60);

  // Exibir moedas do jogador
  textSize(20);
  fill(255, 215, 0);
  text(`Moedas: ${moedasJogador}`, width / 2, 100);

  // Desenhar itens da loja
  if (CONFIG && CONFIG.UPGRADES) {
    const upgrades = Object.values(CONFIG.UPGRADES);
    const itensPorLinha = 3;
    const espacoX = 220;
    const espacoY = 180;
    const startX = width / 2 - espacoX * (itensPorLinha / 2 - 0.5);
    const startY = height / 2 - 100;

    for (let i = 0; i < upgrades.length; i++) {
      const upgrade = upgrades[i];
      const col = i % itensPorLinha;
      const row = Math.floor(i / itensPorLinha);
      const x = startX + col * espacoX;
      const y = startY + row * espacoY;

      // Card do item
      fill(40, 40, 60, 200);
      stroke(100, 100, 150);
      rectMode(CENTER);
      rect(x, y, 200, 150, 10);

      // Ícone do item (círculo colorido)
      noStroke();
      fill(upgrade.COR_ICONE || [150]);
      ellipse(x, y - 30, 50, 50);

      // Nome do upgrade
      fill(255);
      textSize(16);
      text(upgrade.NOME, x, y + 20);

      // Descrição
      fill(180);
      textSize(12);
      text(upgrade.DESCRICAO, x, y + 50, 180);
    }
  }

  textSize(16);
  fill(200);
  text("Pressione ESC para fechar", width / 2, height - 50);
  pop();
}

function keyPressed() {
  if (gerenciadorEstadoJogo && typeof gerenciadorEstadoJogo.aoPressionarTecla === 'function') {
    gerenciadorEstadoJogo.aoPressionarTecla();
  }
}

function mouseClicked() {
  if (gerenciadorEstadoJogo && typeof gerenciadorEstadoJogo.aoClicarMouse === 'function') {
    gerenciadorEstadoJogo.aoClicarMouse();
  }
}

// ===========================================
// FUNÇÕES DE INICIALIZAÇÃO / RESET
// ===========================================
function resetGame() {
  if (poolProjeteis && typeof poolProjeteis.liberarTodos === 'function') poolProjeteis.liberarTodos();
  if (poolParticulas && typeof poolParticulas.liberarTodos === 'function') poolParticulas.liberarTodos();
  inicializarJogo();
}

function inicializarJogo() {
  if (typeof Inimigo !== 'undefined' && spritesInimigos && typeof Inimigo.definirSprites === 'function') {
    Inimigo.definirSprites(spritesInimigos);
  }

  if (typeof Jogador !== 'undefined') {
    jogador = new Jogador((CONFIG.MAPA && CONFIG.MAPA.WIDTH) ? CONFIG.MAPA.WIDTH/2 : width/2, (CONFIG.MAPA && CONFIG.MAPA.HEIGHT) ? CONFIG.MAPA.HEIGHT/2 : height/2);
  } else {
    jogador = jogador || { x: width/2, y: height/2, desenhar: () => {}, atualizar: () => {} };
  }

  const personagemId = localStorage.getItem('perfil.personagem') || 'ARLEN';
  const statsPersonagem = dadosPersonagens[personagemId] || dadosPersonagens['ARLEN'];
  
  // Verifica se a vida de admin está ativa
  const useGodHealth = localStorage.getItem('admin.vida') === 'true';
  if (useGodHealth) {
    jogador.vida = 999;
    jogador.vidaMaxima = 999;
  } else {
    jogador.vida = statsPersonagem.vidaMaxima;
    jogador.vidaMaxima = statsPersonagem.vidaMaxima;
  }

  jogador.velocidade = statsPersonagem.velocidade;
  CONFIG.JOGADOR.COR = statsPersonagem.cor;
  jogador.cooldownDash = localStorage.getItem('admin.dash') === 'true' ? 200 : CONFIG.JOGADOR.DASH.COOLDOWN;

  // Define a arma com base no personagem
  const mapaArmas = {
    'ARLEN': 'CAJADO_CHAMA_ETERNA',
    'KAEL': 'ESPADA_GUARDAO',
    'LYRA': 'ARCO_LUNAR'
  };
  const armaPersonagem = mapaArmas[personagemId] || 'CAJADO_CHAMA_ETERNA';
  
  // Verifica se a arma de admin está ativa
  const useAdminWeapon = localStorage.getItem('admin.arma') === 'true'; // A lógica do painel de admin define isso
  const armaInicial = useAdminWeapon ? 'DECRETO_DIVINO' : armaPersonagem;

  armaJogador = new Arma(armaInicial);

  if (sistemaMelhorias && typeof sistemaMelhorias.aplicarMelhorias === 'function') {
    sistemaMelhorias.aplicarMelhorias();
  }

  sistemaCamera = new Camera(jogador);
  mapaJogo = new MapaJogo();

  inimigos = [];
  powerUps = [];
  moedas = [];

  pontuacao = 0;
  nivel = 1;
  portalAberto = false;

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

window.notificacoesBoss = [];
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
  const quantidadeBase = Math.max(0, Math.floor(opts.quantidade || 10));
  let densidade = obterConfiguracao('config.densidadeParticulas', 'media');
  let fator = 1;
  if (densidade === 'desligado') fator = 0;
  else if (densidade === 'baixa') fator = 0.5;
  else if (densidade === 'alta') fator = 1.5;
  const quantidade = Math.max(0, Math.floor(quantidadeBase * fator));
  if (quantidade <= 0) return;
  for (let i = 0; i < quantidade; i++) {
    const ang = random(TWO_PI);
    const vel = random((opts.velocidade && opts.velocidade[0]) || 1, (opts.velocidade && opts.velocidade[1]) || 3);
    const p = (typeof poolParticulas.obter === 'function') ? poolParticulas.obter() : {};
    p.x = x; p.y = y; p.vx = cos(ang) * vel; p.vy = sin(ang) * vel;
    p.vida = (typeof opts.vida === 'number') ? opts.vida : (CONFIG && CONFIG.PARTICULA && CONFIG.PARTICULA.TEMPO_VIDA) ? CONFIG.PARTICULA.TEMPO_VIDA : 60;
    p.tamanho = random((CONFIG && CONFIG.PARTICULA && CONFIG.PARTICULA.TAMANHO_MIN) || 2, (CONFIG && CONFIG.PARTICULA && CONFIG.PARTICULA.TAMANHO_MAX) || 5);
    p.cor = Array.isArray(opts.cor) ? opts.cor : (opts.cor || [255,255,255]);
    p.remover = false;
    if (typeof poolParticulas.adicionar === 'function') poolParticulas.adicionar(p);
  }
}