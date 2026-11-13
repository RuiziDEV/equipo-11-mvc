export class NotasControlador {
  #modelo;
  #vista;

  constructor(modelo, vista) {
    this.#modelo = modelo;
    this.#vista = vista;

    this.#vista.alAgregar((datos) => this.#intentar(() => {
      this.#modelo.agregar(datos);
      this.#vista.limpiarFormulario();
    }));

    this.#vista.alEliminar((id) => this.#intentar(() => {
      this.#modelo.eliminar(id);
    }));

    this.#vista.alCalificar((id, nota) => this.#intentar(() => {
      this.#modelo.calificar(id, nota);
    }));
  }

  #intentar(accion) {
    try {
      accion();
      this.#vista.limpiarError();
    } catch (error) {
      if (error.name === 'ErrorDeReglas') {
        this.#vista.mostrarError(error.message);
        this.#vista.render(); // Redibujar para descartar cambios inválidos en los inputs
      } else {
        throw error;
      }
    }
  }
}