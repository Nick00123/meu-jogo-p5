// ===========================================
// IMPLEMENTAÇÃO DE QUADTREE PARA DETECÇÃO DE COLISÕES
// ===========================================

class Retangulo {
  constructor(x, y, largura, altura) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;
  }

  contem(ponto) {
    return (
      ponto.x >= this.x - this.largura / 2 &&
      ponto.x <= this.x + this.largura / 2 &&
      ponto.y >= this.y - this.altura / 2 &&
      ponto.y <= this.y + this.altura / 2
    );
  }

  intercepta(intervalo) {
    return !(
      this.x + this.largura / 2 < intervalo.x - intervalo.largura / 2 ||
      this.x - this.largura / 2 > intervalo.x + intervalo.largura / 2 ||
      this.y + this.altura / 2 < intervalo.y - intervalo.altura / 2 ||
      this.y - this.altura / 2 > intervalo.y + intervalo.altura / 2
    );
  }
}

class QuadTree {
  constructor(limite, capacidade) {
    this.limite = limite;
    this.capacidade = capacidade;
    this.pontos = [];
    this.dividido = false;
  }

  subdividir() {
    const x = this.limite.x;
    const y = this.limite.y;
    const w = this.limite.largura / 2;
    const h = this.limite.altura / 2;

    const ne = new Retangulo(x + w / 2, y - h / 2, w, h);
    const nw = new Retangulo(x - w / 2, y - h / 2, w, h);
    const se = new Retangulo(x + w / 2, y + h / 2, w, h);
    const sw = new Retangulo(x - w / 2, y + h / 2, w, h);

    this.nordeste = new QuadTree(ne, this.capacidade);
    this.noroeste = new QuadTree(nw, this.capacidade);
    this.sudeste = new QuadTree(se, this.capacidade);
    this.sudoeste = new QuadTree(sw, this.capacidade);

    this.dividido = true;
  }

  inserir(ponto) {
    if (!this.limite.contem(ponto)) {
      return false;
    }

    if (this.pontos.length < this.capacidade) {
      this.pontos.push(ponto);
      return true;
    }

    if (!this.dividido) {
      this.subdividir();
    }

    return (
      this.nordeste.inserir(ponto) ||
      this.noroeste.inserir(ponto) ||
      this.sudeste.inserir(ponto) ||
      this.sudoeste.inserir(ponto)
    );
  }

  consultar(intervalo, encontrados) {
    if (!encontrados) {
      encontrados = [];
    }

    if (!this.limite.intercepta(intervalo)) {
      return encontrados;
    }

    for (let p of this.pontos) {
      if (intervalo.contem(p)) {
        encontrados.push(p);
      }
    }

    if (this.dividido) {
      this.nordeste.consultar(intervalo, encontrados);
      this.noroeste.consultar(intervalo, encontrados);
      this.sudeste.consultar(intervalo, encontrados);
      this.sudoeste.consultar(intervalo, encontrados);
    }

    return encontrados;
  }

  limpar() {
    this.pontos = [];
    if (this.dividido) {
      this.nordeste.limpar();
      this.noroeste.limpar();
      this.sudeste.limpar();
      this.sudoeste.limpar();
      this.dividido = false;
    }
  }

  desenhar() {
    stroke(0, 255, 0);
    noFill();
    rectMode(CENTER);
    rect(
      this.limite.x,
      this.limite.y,
      this.limite.largura,
      this.limite.altura
    );

    if (this.dividido) {
      this.nordeste.desenhar();
      this.noroeste.desenhar();
      this.sudeste.desenhar();
      this.sudoeste.desenhar();
    }
  }
}
