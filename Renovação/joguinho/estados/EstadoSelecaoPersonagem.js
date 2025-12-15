// ===========================================
// ESTADO DE SELEÇÃO DE PERSONAGEM
// ===========================================

class EstadoSelecaoPersonagem extends EstadoBase {
  constructor(gerenciador) {
    super(gerenciador);
    this.personagens = [
      {
        id: 'ARLEN',
        nome: "ARLEN",
        titulo: "O ESTRATEGISTA",
        descricao: "Guerreiro determinado que carrega uma chama ancestral no peito, símbolo de força e coragem. Sua presença impõe respeito e proteção ao grupo.",
        cor: [100, 150, 255], // Azul
        imagem: 'arlen'
      },
      {
        id: 'KAEL',
        nome: "KAEL",
        titulo: "O CAÇADOR VELOZ",
        descricao: "Impulsivo e poderoso, controla trovões para golpear com velocidade e intensidade. Sua energia elétrica torna o combate imprevisível e devastador.",
        cor: [139, 69, 19], // Verde
        imagem: 'kael'
      },
      {
        id: 'LYRA',
        nome: "LYRA",
        titulo: "A ARQUEIRA",
        descricao: "Ágil e inteligente, domina a energia da lua para criar luz, ilusões e estratégias brilhantes. É a mente tática e serena da equipe.",
        cor: [220, 150, 255], // Roxo/Rosa
        imagem: 'lyra'
      }
    ];
    this.selecionado = 0;
    this.fundoEstrelas = [];

    // Adiciona uma propriedade para suavizar a animação de escala
    this.escalas = this.personagens.map(() => 3.0);
    this.velocidadeAnimacao = 0.1;
  }

  entrar() {
    this.selecionado = 0;
    // Criar um fundo de estrelas simples para consistência visual
    if (this.fundoEstrelas.length === 0) {
      for (let i = 0; i < 150; i++) {
        this.fundoEstrelas.push({
          x: random(width),
          y: random(height),
          s: random(1, 3),
          a: random(50, 150)
        });
      }
    }
  }

  desenhar() {
    // Atualiza a escala de cada personagem para uma animação suave
    for (let i = 0; i < this.personagens.length; i++) {
      const alvo = (i === this.selecionado) ? 1.15 : 1.0; // 1.15 para selecionado, 1.0 para os outros
      this.escalas[i] = lerp(this.escalas[i], alvo, this.velocidadeAnimacao);
    }


    background(10, 15, 30);

    // Desenhar fundo de estrelas
    noStroke();
    for (const estrela of this.fundoEstrelas) {
      fill(200, 220, 255, estrela.a);
      ellipse(estrela.x, estrela.y, estrela.s);
    }

    // Título da tela
    textAlign(CENTER, CENTER);
    fill(255, 215, 0);
    textSize(36);
    text("ESCOLHA SEU EXPLORADOR", width / 2, height * 0.15);

    // Desenhar os personagens
    const totalPersonagens = this.personagens.length;
    const espacamento = width / (totalPersonagens + 1);

    for (let i = 0; i < totalPersonagens; i++) {
      const p = this.personagens[i];
      const x = espacamento * (i + 1);
      const y = height / 2;
      const isSelected = (i === this.selecionado);
      const escalaAtual = this.escalas[i];

      push();
      // Centraliza a transformação no card para o efeito de escala funcionar corretamente
      translate(x, y);
      scale(escalaAtual);

      if (isSelected) {
        // Destaque para o personagem selecionado
        stroke(200, 160, 0); // Cor do contorno alterada para um dourado menos brilhante.
        strokeWeight(2); // Espessura do contorno levemente reduzida.
        fill(p.cor[0] * 0.2, p.cor[1] * 0.2, p.cor[2] * 0.2, 180); // Fundo do card mais escuro e sólido.
        rectMode(CENTER);
        rect(0, 0, 240, 380, 15); // Tamanho do card aumentado.
      }

      // Desenha a imagem do personagem
      const img = imagensPersonagens[p.imagem];
      if (img) {
        push();
        imageMode(CENTER);
        // Se o personagem não estiver selecionado, deixa a imagem um pouco mais escura
        if (!isSelected) {
          tint(150); 
        }
        // Ajusta o tamanho da imagem para caber no card
        image(img, 0, -40, 300, 300); // Exemplo: Aumentado para 180x180
        pop();
      }

      // Nome e Título
      fill(255, 255, 255); // Nome: Branco para todos os personagens.
      textSize(24);
      text(p.nome, 0, 40);

      fill(isSelected ? p.cor : 0); // Título: Cor do personagem para selecionado, cinza para os outros.
      textSize(14);
      text(p.titulo, 0, 65);

      // Descrição
      // A descrição só aparece para o personagem selecionado
      if (isSelected) {
        fill(10); // Cor do texto da descrição alterada para cinza escuro, para melhor contraste
        textSize(12);
        text(p.descricao, 0, 120, 180);
      }
      pop();
    }

    // Instruções
    fill(200);
    textSize(16);
    text("Use as setas ← → para navegar e ENTER para confirmar", width / 2, height * 0.9);
  }

  aoPressionarTecla() {
    if (keyCode === LEFT_ARROW) {
      this.selecionado = (this.selecionado - 1 + this.personagens.length) % this.personagens.length;
    } else if (keyCode === RIGHT_ARROW) {
      this.selecionado = (this.selecionado + 1) % this.personagens.length;
    } else if (keyCode === ENTER) {
      this.selecionarPersonagem();
    }
  }

  selecionarPersonagem() {
    const personagemEscolhido = this.personagens[this.selecionado];
    console.log(`Personagem selecionado: ${personagemEscolhido.nome}`);

    // Salva a escolha no localStorage para ser usada em outras partes do jogo
    localStorage.setItem('perfil.personagem', personagemEscolhido.id);

    // Avança para o Lobby
    this.gerenciador.mudarEstado('LOBBY');
  }
}