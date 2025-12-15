// ===========================================
// ESTADO DE JOGO PRINCIPAL
// ===========================================

class EstadoJogando extends EstadoBase {
  constructor(gerenciador) {
    super(gerenciador);
    this.prompt = ''; // Variável para armazenar o texto de interação
    this.textoPlacaVisivel = null; // Para o texto da placa do puzzle
  }

  entrar() {
    // Função chamada quando o estado 'JOGANDO' é ativado.
    // Pode ser usada para inicializar elementos específicos do jogo.
    // A inicialização do jogo foi removida daqui para evitar que o nível seja resetado
    // ao voltar de outros estados, como o de Puzzle.
  }

  atualizar() {
    // Atualiza todos os elementos do jogo
  if (jogador) jogador.atualizar();
  if (sistemaCamera) sistemaCamera.atualizar();
  
  this.atualizarInteracoesMundo();
  this.atualizarPrompt();
  // Lógica de tiro contínuo otimizada
  if (mouseIsPressed && mouseButton === LEFT && armaJogador?.atirar) {
    const alvoX = mouseX - (width / 2 - sistemaCamera.x);
    const alvoY = mouseY - (height / 2 - sistemaCamera.y);
    armaJogador.atirar(jogador.x, jogador.y, alvoX, alvoY);
    }

    // Lógica de progressão de nível
    if (!portalAberto && inimigos.length === 0 && !gerenciadorPuzzles.altarAtivo) {
      // Sempre cria um portal para o próximo nível quando a sala está limpa.
      portalAberto = true;
      portal.tipo = 'normal';
      portal.x = random(100, CONFIG.MAPA.LARGURA - 100);
      portal.y = random(100, CONFIG.MAPA.ALTURA - 100);
    }

    // Verifica se o jogador entrou no portal
    if (portalAberto && dist(jogador.x, jogador.y, portal.x, portal.y) < (jogador.tamanho + portal.tamanho) / 2) {      
      if (portal.tipo === 'boss') {
        spawnarBoss();
        portalAberto = false; // Fecha o portal após entrar
        return;
      }
      nivel++;
      portalAberto = false;
      spawnarInimigos(); // Gera inimigos para o novo nível
      // Opcional: curar um pouco o jogador ao avançar
    }

    // Atualizar inimigos
    for (let i = inimigos.length - 1; i >= 0; i--) {
      inimigos[i].atualizar(jogador);
      if (inimigos[i].remover) {
        inimigos.splice(i, 1);
      }
    }

    // Atualizar projéteis do pool
    if (poolProjeteis && poolProjeteis.emUso) {
      for (let i = poolProjeteis.emUso.length - 1; i >= 0; i--) {
        const p = poolProjeteis.emUso[i];
        p.x += p.vx;
        p.y += p.vy;

        // Lógica de remoção (ex: saiu da tela)
        if (p.x < 0 || p.x > CONFIG.MAPA.LARGURA || p.y < 0 || p.y > CONFIG.MAPA.ALTURA) {
          poolProjeteis.liberar(p);
        }
      }
    }

    // Verificar colisões
    verificarColisoes();
  }

  atualizarInteracoesMundo() {
    this.textoPlacaVisivel = null; // Reseta a cada frame
    const altar = gerenciadorPuzzles.altarAtivo;

    if (altar && jogador) {
      const posPlacaX = altar.x - 80; // Posição da placa à esquerda do altar
      const posPlacaY = altar.y;
      const distanciaPlaca = dist(jogador.x, jogador.y, posPlacaX, posPlacaY);

      if (distanciaPlaca < 80) { // Raio de leitura da placa
        this.textoPlacaVisivel =
`Nas pedras, um eco do saber se alastra,
Um ciclo de poder que o tempo arrasta.

"O conhecimento nasce da lógica, passa pelos dados e se manifesta no código."

Busque a essência, não a forma vazia,
E em quatro letras que ecoam em corredores de esperança,
Encontre o segredo que a pedra irradia.`;
      }
    }
  }

  atualizarPrompt() {
    this.prompt = ''; // Limpa o prompt a cada frame
    const altar = gerenciadorPuzzles.altarAtivo;

    if (altar && jogador) {
      const distancia = dist(jogador.x, jogador.y, altar.x, altar.y);
      if (distancia < altar.tamanho + 30) { // 30 pixels de margem
        this.prompt = "Pressione 'E' para interagir com o Altar";
      }
    }
    // Futuramente, outros prompts (como para o vendedor) podem ser adicionados aqui.
  }

  desenhar() {
 background(CONFIG.MAPA.BACKGROUND_COLOR);
  push();
  if (sistemaCamera) sistemaCamera.aplicar();
  // Desenha apenas o que está visível
  if (mapaJogo) mapaJogo.desenhar();
  // Desenha projéteis visíveis
  if (poolProjeteis?.emUso) {
    sistemaRenderizacao.desenharObjetos(
      poolProjeteis.emUso,
      p => {
        fill(p.cor);
        noStroke();
        ellipse(p.x, p.y, p.tamanho);
      }
    );
  }
  // Desenha inimigos visíveis
  sistemaRenderizacao.desenharObjetos(
    inimigos,
    inimigo => inimigo.desenhar()
  );
  if (jogador) jogador.desenhar();

    // Desenhar o portal se estiver aberto
    if (portalAberto) {
      push();
      fill(0, 255, 255, 100 + 155 * sin(millis() * 0.005));
      stroke(255);
      strokeWeight(2);
      ellipse(portal.x, portal.y, portal.tamanho, portal.tamanho);
      pop();
    }

    // Desenhar o altar do puzzle se estiver ativo
    const altar = gerenciadorPuzzles.altarAtivo;
    if (altar) {
      push();
      // Desenha a placa ao lado do altar
      const posPlacaX = altar.x - 80;
      const posPlacaY = altar.y;
      fill(110, 90, 80);
      stroke(80, 60, 50);
      strokeWeight(3);
      rectMode(CENTER);
      rect(posPlacaX, posPlacaY, 40, 60, 5);

      // Desenha o altar
      const pulsacao = 1 + 0.1 * sin(millis() * 0.003);
      fill(100, 100, 250, 150);
      stroke(200, 200, 255);
      strokeWeight(3);
      ellipse(altar.x, altar.y, altar.tamanho * pulsacao);
      fill(255);
      textAlign(CENTER, CENTER);
      text("E", altar.x, altar.y);
      pop();
    }

    pop(); // Fim da câmera

    // Desenhar HUD e outros elementos de interface
    desenharHUD();
    desenharMinimapa();
    desenharBossHUD();

    // Desenha o prompt de interação, se houver
    if (this.prompt) {
      push();
      fill(255, 255, 0);
      textAlign(CENTER, CENTER);
      textSize(18);
      text(this.prompt, width / 2, height - 60);
      pop();
    }

    // Desenha o texto da placa se estiver visível
    if (this.textoPlacaVisivel) {
      push();
      const boxWidth = 600;
      const boxHeight = 180;
      fill(0, 0, 0, 200);
      stroke(255, 215, 0);
      rectMode(CENTER);
      rect(width / 2, height / 2, boxWidth, boxHeight, 10);
      fill(230);
      noStroke();
      textSize(16);
      text(this.textoPlacaVisivel, width / 2, height / 2, boxWidth - 40, boxHeight - 40);
      pop();
    }
  }

  aoPressionarTecla() {
    if (key === 'p' || key === 'P') {
      this.gerenciador.mudarEstado('PAUSADO');
    }
    if (keyCode === 32) { // Tecla Espaço
      if (jogador) jogador.dash();
    }
    const altar = gerenciadorPuzzles.altarAtivo;
    if ((key === 'e' || key === 'E') && altar) {
      if (dist(jogador.x, jogador.y, altar.x, altar.y) < altar.tamanho) {
        // Inicia o puzzle correspondente ao nível do altar
        gerenciadorPuzzles.iniciarPuzzleParaNivel(altar.nivel);
        if (gerenciadorPuzzles.puzzleAtivo) {
          gerenciadorEstados.mudarEstado('PUZZLE');
        }
      }
    }
  }

  aoClicarMouse() {
    // A lógica de tiro foi movida para o método atualizar() para permitir disparo contínuo.
  }
}