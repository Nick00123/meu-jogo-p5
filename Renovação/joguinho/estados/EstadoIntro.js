// ----------------------------------------------
// ESTADO INTRO – versão otimizada e cinematográfica
// ----------------------------------------------

class EstadoIntro extends EstadoBase {
  constructor(gerenciador) {
    super(gerenciador);

    // Controle de texto
    this.cena = 0;
    this.contagemChars = 0;
    this.velocidadeDigitacaoMs = 35; // MAIS DEVAGAR
    this.pausaPosDigitacao = 1300;

    // Tempo / fade
    this.horaInicio = 0;
    this.proximaTrocaEm = 0;
    this.duracaoFade = 1000;  
    this.fadeFinalAtivo = false;
    this.inicioFadeFinal = 0;
    this.duracaoFadeFinal = 2500;

    // Fundo estrelado
    this.estrelas = [];

    // Tamanho das imagens (80% da tela)
    this.escalaImagem = 0.80;

    // Efeito de Zoom (Ken Burns)
    this.escalaZoom = 1.0;
    this.zoomVelocidade = 0.02; // Velocidade do zoom por segundo
    this.indiceImagemAnterior = -1;

    // Mapa de Cenas: Define qual imagem aparece em cada linha de texto.
    // O índice do array corresponde ao índice da linha de texto.
    this.mapaCenas = [
      "mundoMagico",      // Linha 0
      "mundoMagico",      // Linha 1
      "mundoMagico",      // Linha 2
      "tresExploradores", // Linha 3
      "tresExploradores", // Linha 4
      "tresExploradores", // Linha 5
      "tresExploradores", // Linha 6
      "jornada",          // Linha 7
      "MapaMistico",      // Linha 8
      "EntradaCaverna",   // Linha 9
      "EntradaCaverna",   // Linha 10
      "Criaturas",        // Linha 11
      "puzzleCaverna",    // Linha 12
      "puzzleCaverna",    // Linha 13
      "chefeFinal",       // Linha 14
      "chefeFinal",       // Linha 15 em diante...
    ];

    // Textos vindos do JSON
    this.linhas = dadosIntro.linhas;
  }

  entrar() {
    this.horaInicio = millis();
    this.contagemChars = 0;
    this.proximaTrocaEm = this.calcularProximaTroca();
    this.fadeFinalAtivo = false;

    // Criar estrelas
    this.estrelas = [];
    for (let i = 0; i < 120; i++) {
      this.estrelas.push({
        x: random(width),
        y: random(height),
        z: random(0.2, 1.2),
        s: random(0.5, 2.0)
      });
    }
  }

  calcularProximaTroca() {
    const texto = this.linhas[this.cena] || "";
    const tempoDigitacao = texto.length * this.velocidadeDigitacaoMs;

    return this.horaInicio + tempoDigitacao + this.pausaPosDigitacao;
  }

  atualizar() {
    const agora = millis();
    const textoAtual = this.linhas[this.cena] || "";

    // Digitação
    if (this.contagemChars < textoAtual.length) {
      const decorrido = agora - this.horaInicio;
      this.contagemChars = min(
        textoAtual.length,
        floor(decorrido / this.velocidadeDigitacaoMs)
      );
    }

    // Mudança de cena
    if (agora >= this.proximaTrocaEm) {
      // Verifica se a imagem vai mudar para resetar o zoom
      const nomeImagemAtual = this.mapaCenas[this.cena] || "chefeFinal";
      const proximoNomeImagem = this.mapaCenas[this.cena + 1] || "chefeFinal";

      if (proximoNomeImagem !== nomeImagemAtual) {
        this.escalaZoom = 1.0; // Reseta o zoom para a próxima imagem
      }

      this.cena++;

      if (this.cena >= this.linhas.length) {
        // Iniciar fade final
        if (!this.fadeFinalAtivo) {
          this.fadeFinalAtivo = true;
          this.inicioFadeFinal = agora;
        }
      } else {
        this.horaInicio = agora;
        this.contagemChars = 0;
        this.proximaTrocaEm = this.calcularProximaTroca();
      }
    }

    // Finalizar intro
    if (this.fadeFinalAtivo && agora - this.inicioFadeFinal > this.duracaoFadeFinal) {
      this.gerenciador.mudarEstado("MENU");
    }

    // Atualiza o zoom continuamente
    this.escalaZoom += (this.zoomVelocidade * (deltaTime / 1000));
  }

  desenharFundo() {
    background(6, 8, 16);

    noStroke();
    for (let s of this.estrelas) {
      fill(200, 220, 255, 150 * s.z);
      ellipse(s.x, s.y, s.s);
    }
  }

imagemDaCenaAtual() {
  // Usa o mapa de cenas para encontrar a imagem correta para a linha de texto atual.
  // Se a cena atual ultrapassar o mapa, usa a última imagem definida (chefeFinal).
  const nomeImagem = this.mapaCenas[this.cena] || "chefeFinal";
  // Usa a variável global 'imagensIntro' carregada em sketch.js
  return imagensIntro[nomeImagem];
}

  desenharImagem() {
  const img = this.imagemDaCenaAtual();
  if (!img) {
    console.warn('Nenhuma imagem para desenhar!');
    return;
  }

    // Aplica o efeito de zoom na escala base
    const escala = min(
      (width * this.escalaImagem) / img.width,
      (height * 0.55) / img.height
    ) * this.escalaZoom;

    const w = img.width * escala;
    const h = img.height * escala;

    let alpha = 255;

    // Lógica de Fade In/Out
    const tCena = millis() - this.horaInicio;
    const nomeImagemAtual = this.mapaCenas[this.cena] || "chefeFinal";

    // 1. Fade-in: Apenas quando a imagem MUDA (índice diferente do anterior)
    if (nomeImagemAtual !== this.indiceImagemAnterior && tCena < this.duracaoFade) {
      alpha = map(tCena, 0, this.duracaoFade, 0, 255);
    }

    // 2. Fade-out: Apenas na última cena de texto ANTES da imagem mudar
    const proximoNomeImagem = this.mapaCenas[this.cena + 1] || "chefeFinal";
    if (proximoNomeImagem !== nomeImagemAtual) {
      const faltando = this.proximaTrocaEm - millis();
      if (faltando < this.duracaoFade) {
        alpha = map(faltando, 0, this.duracaoFade, 0, 255);
      }
    }

    // Atualiza o índice da imagem anterior no final do desenho
    this.indiceImagemAnterior = nomeImagemAtual;

    // Imagem mais escura (35% escurecida)
    push();
    tint(180, alpha); 
    imageMode(CENTER);
    image(img, width / 2, height / 2.5, w, h);
    pop();
  }

  desenharTexto() {
    const pad = 30;
    const boxW = min(width * 0.8, 800);
    const boxH = 150;
    const boxX = (width - boxW) / 2;
    const boxY = height - boxH - 30;

    fill(12, 16, 26, 220);
    rect(boxX, boxY, boxW, boxH, 10);

    const texto = this.linhas[this.cena] || "";
    const visivel = texto.substring(0, this.contagemChars);

    fill(255);
    textSize(18);
    textAlign(LEFT, TOP);
    text(visivel, boxX + pad, boxY + pad, boxW - pad * 2);
  }

  desenharFadeFinal() {
    if (this.fadeFinalAtivo) {
      const t = constrain((millis() - this.inicioFadeFinal) / this.duracaoFadeFinal, 0, 1);
      fill(0, t * 255);
      rect(0, 0, width, height);
    }
  }

  desenhar() {
    this.desenharFundo();
    this.desenharImagem();
    this.desenharTexto();
    this.desenharFadeFinal();

    // Adiciona um aviso para pular a introdução
    if (!this.fadeFinalAtivo) {
      push();
      textAlign(CENTER, BOTTOM);
      textSize(14);
      fill(200, 200, 200, 150); // Branco semi-transparente
      text("Pressione ENTER para pular", width / 2, height - 20);
      pop();
    }
  }

  aoPressionarTecla() {
    // Pula a introdução se a tecla ENTER for pressionada
    if (keyCode === ENTER) {
      this.gerenciador.mudarEstado("MENU");
    }
  }
}
