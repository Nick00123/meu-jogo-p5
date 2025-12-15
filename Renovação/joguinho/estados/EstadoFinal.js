class EstadoFinal extends EstadoBase {
  constructor() {
    super();
    this.nome = "EstadoFinal";
    this.textoCreditos = [];
  }

  carregarCreditos() {
    // Assumindo que você tem um arquivo creditos.json na pasta assets/dados
    loadJSON('assets/dados/creditos.json', (dados) => {
      this.textoCreditos = dados.linhas;
    });
  }

  entrar() {
    console.log("Entrando no Estado Final");
    this.carregarCreditos();

    this.fase = 'INTRO'; // INTRO, APROXIMACAO, ESCOLHA, NARRATIVA, CREDITOS
    this.alphaTextoIntro = 0;
    this.alphaTelaPreta = 0;
    this.tempoEntrada = millis();

    this.cristal = {
      x: width / 2,
      y: height / 2,
      raio: 50,
      brilho: 0,
    };

    this.textoNarrativo = "";
    this.mostrarEscolhas = false;

    // Configuração dos botões de escolha
    const btnWidth = 400;
    const btnHeight = 120;
    const btnY = height / 2 + 100;
    this.botaoAssumir = {
      x: width / 4 - btnWidth / 2, y: btnY, w: btnWidth, h: btnHeight,
      texto: "Assumir o poder.\nConhecer tudo.\nControlar o impossível."
    };
    this.botaoDeixar = {
      x: (width * 3) / 4 - btnWidth / 2, y: btnY, w: btnWidth, h: btnHeight,
      texto: "Deixar o poder intocado.\nPreservar a ordem.\nManter a paz."
    };

    // Configuração dos créditos
    this.creditosPosicaoY = height + 50;
    this.velocidadeCreditos = 1;
  }

  atualizar() {
    // Animação do cristal flutuando e brilhando
    this.cristal.y = height / 2 + sin(millis() * 0.001) * 10;
    this.cristal.brilho = 150 + sin(millis() * 0.002) * 105;

    switch (this.fase) {
      case 'INTRO':
        this.alphaTextoIntro = min(this.alphaTextoIntro + 0.5, 255);
        if (millis() - this.tempoEntrada > 5000) { // Após 5 segundos
          this.fase = 'APROXIMACAO';
        }
        break;

      case 'APROXIMACAO':
        // Simula a aproximação do jogador (poderia ser ativada por distância)
        if (millis() - this.tempoEntrada > 7000) { // Após mais 2 segundos
          this.fase = 'ESCOLHA';
          this.mostrarEscolhas = true;
        }
        break;

      case 'NARRATIVA':
        this.alphaTelaPreta = min(this.alphaTelaPreta + 1, 255);
        if (this.alphaTelaPreta >= 255) {
          if (millis() - this.tempoEntrada > 5000) { // Espera 5s no texto final
            this.fase = 'CREDITOS';
          }
        }
        break;

      case 'CREDITOS':
        this.creditosPosicaoY -= this.velocidadeCreditos;
        break;
    }
  }

  desenhar() {
    background(10, 5, 15); // Fundo escuro e calmo

    // Desenha o cristal
    if (this.fase !== 'NARRATIVA' || this.alphaTelaPreta < 255) {
      push();
      noStroke();
      // Aura do cristal
      fill(100, 180, 255, this.cristal.brilho / 2);
      ellipse(this.cristal.x, this.cristal.y, this.cristal.raio * 4);
      // Cristal
      fill(200, 240, 255);
      ellipse(this.cristal.x, this.cristal.y, this.cristal.raio);
      pop();
    }

    // Desenha textos e elementos de cada fase
    switch (this.fase) {
      case 'INTRO':
        this.desenharTextoCentral("O guardião caiu.\nO poder permanece.", this.alphaTextoIntro);
        break;

      case 'APROXIMACAO':
        this.desenharTextoCentral("O Núcleo não exige força.\nExige decisão.", 255);
        break;

      case 'ESCOLHA':
        this.desenharTextoCentral("O Núcleo não exige força.\nExige decisão.", 255);
        this.desenharBotoesEscolha();
        break;

      case 'NARRATIVA':
        // A tela escurece gradualmente
        fill(0, this.alphaTelaPreta);
        rect(0, 0, width, height);
        if (this.alphaTelaPreta >= 255) {
          this.desenharTextoCentral(this.textoNarrativo, 255);
        }
        break;

      case 'CREDITOS':
        background(0);
        this.desenharCreditos();
        break;
    }
  }

  desenharTextoCentral(texto, alpha) {
    push();
    fill(230, 230, 255, alpha);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(texto, width / 2, height / 2 - 150);
    pop();
  }

  desenharBotoesEscolha() {
    const mouseSobreAssumir = mouseX > this.botaoAssumir.x && mouseX < this.botaoAssumir.x + this.botaoAssumir.w &&
                             mouseY > this.botaoAssumir.y && mouseY < this.botaoAssumir.y + this.botaoAssumir.h;
    const mouseSobreDeixar = mouseX > this.botaoDeixar.x && mouseX < this.botaoDeixar.x + this.botaoDeixar.w &&
                             mouseY > this.botaoDeixar.y && mouseY < this.botaoDeixar.y + this.botaoDeixar.h;

    // Botão 1: Assumir
    push();
    fill(mouseSobreAssumir ? '#c62828' : '#b71c1c');
    stroke(255, 100, 100);
    rect(this.botaoAssumir.x, this.botaoAssumir.y, this.botaoAssumir.w, this.botaoAssumir.h, 10);
    fill(255);
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    text(this.botaoAssumir.texto, this.botaoAssumir.x + this.botaoAssumir.w / 2, this.botaoAssumir.y + this.botaoAssumir.h / 2);
    pop();

    // Botão 2: Deixar
    push();
    fill(mouseSobreDeixar ? '#1565c0' : '#0d47a1');
    stroke(100, 150, 255);
    rect(this.botaoDeixar.x, this.botaoDeixar.y, this.botaoDeixar.w, this.botaoDeixar.h, 10);
    fill(255);
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    text(this.botaoDeixar.texto, this.botaoDeixar.x + this.botaoDeixar.w / 2, this.botaoDeixar.y + this.botaoDeixar.h / 2);
    pop();
  }

  desenharCreditos() {
    push();
    fill(220);
    textSize(28);
    textAlign(CENTER, TOP);
    let y = this.creditosPosicaoY;
    for (const linha of this.textoCreditos) {
      text(linha, width / 2, y);
      y += 40; // Espaçamento entre linhas
    }
    pop();
  }

  aoClicarMouse() {
    if (this.fase !== 'ESCOLHA') return;

    const mouseSobreAssumir = mouseX > this.botaoAssumir.x && mouseX < this.botaoAssumir.x + this.botaoAssumir.w &&
                             mouseY > this.botaoAssumir.y && mouseY < this.botaoAssumir.y + this.botaoAssumir.h;
    const mouseSobreDeixar = mouseX > this.botaoDeixar.x && mouseX < this.botaoDeixar.x + this.botaoDeixar.w &&
                             mouseY > this.botaoDeixar.y && mouseY < this.botaoDeixar.y + this.botaoDeixar.h;

    if (mouseSobreAssumir) {
      this.textoNarrativo = "O conhecimento absoluto foi alcançado.\nMas nenhum poder vem sem consequências.";
      this.fase = 'NARRATIVA';
      this.tempoEntrada = millis();
    } else if (mouseSobreDeixar) {
      this.textoNarrativo = "Nem tudo precisa ser usado.\nÀs vezes, preservar é o maior ato de sabedoria.";
      this.fase = 'NARRATIVA';
      this.tempoEntrada = millis();
    }
  }
}