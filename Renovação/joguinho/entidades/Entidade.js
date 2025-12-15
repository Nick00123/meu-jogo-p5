// Entidade.js
class Entidade {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.tamanho = 30;
      this.ativo = true;
    }
  
    atualizar() {
      // Método a ser sobrescrito pelas classes filhas
    }
  
    desenhar() {
      // Método a ser sobrescrito pelas classes filhas
    }
  
    colidiuCom(outraEntidade) {
      if (!outraEntidade) return false;
      const distancia = dist(this.x, this.y, outraEntidade.x, outraEntidade.y);
      return distancia < (this.tamanho/2 + outraEntidade.tamanho/2);
    }
  }