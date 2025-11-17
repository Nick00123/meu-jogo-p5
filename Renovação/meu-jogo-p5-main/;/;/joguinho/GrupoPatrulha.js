// Sistema de Grupo de Patrulha
class GrupoPatrulha {
  constructor(centroX, centroY, quantidadeMembros) {
    this.membros = [];
    this.centroX = centroX;
    this.centroY = centroY;
    this.raioPatrulha = 100;
    this.velocidadePatrulha = 0.5;
    this.nivelAlerta = 0;
    this.decaimentoAlerta = 0.5;

    // Cria formação de patrulha
    for (let i = 0; i < quantidadeMembros; i++) {
      let angulo = (TWO_PI / quantidadeMembros) * i;
      let x = centroX + cos(angulo) * this.raioPatrulha;
      let y = centroY + sin(angulo) * this.raioPatrulha;

      let inimigo = new InimigoAprimorado(x, y, 'NORMAL');
      inimigo.grupoPatrulha = this;
      inimigo.indicePatrulha = i;
      this.membros.push(inimigo);
    }
  }

  atualizar(jogador) {
    // Atualiza movimento de patrulha
    this.centroX += cos(frameCount * 0.01) * this.velocidadePatrulha;
    this.centroY += sin(frameCount * 0.01) * this.velocidadePatrulha;

    // Verifica detecção do jogador
    let jogadorDetectado = false;
    for (let membro of this.membros) {
      if (dist(membro.x, membro.y, jogador.x, jogador.y) < membro.raioAlerta) {
        jogadorDetectado = true;
        break;
      }
    }

    if (jogadorDetectado) {
      this.nivelAlerta = min(this.nivelAlerta + 2, 100);
      this.membros.forEach(m => m.alertado = true);
    } else {
      this.nivelAlerta = max(this.nivelAlerta - this.decaimentoAlerta, 0);
      if (this.nivelAlerta <= 0) this.membros.forEach(m => m.alertado = false);
    }

    // Atualiza posições dos membros
    for (let i = 0; i < this.membros.length; i++) {
      let membro = this.membros[i];
      let angulo = (TWO_PI / this.membros.length) * i + frameCount * 0.01;
      if (!membro.alertado) {
        membro.moverPara(this.centroX + cos(angulo) * this.raioPatrulha, this.centroY + sin(angulo) * this.raioPatrulha, membro.velocidade * 0.5);
      }
    }
  }
}