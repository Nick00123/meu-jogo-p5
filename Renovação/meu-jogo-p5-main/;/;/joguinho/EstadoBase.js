class EstadoBase {
  constructor(gerenciador) {
    this.gerenciador = gerenciador;
  }

  entrar() {
    // Override in subclasses
  }

  sair() {
    // Override in subclasses
  }

  atualizar() {
    // Override in subclasses
  }

  desenhar() {
    // Override in subclasses
  }

  aoPressionarTecla() {
    // Override in subclasses
  }
}