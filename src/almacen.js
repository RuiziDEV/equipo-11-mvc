export class AlmacenMemoria {
  #datos;

  constructor(datos = null) {
    this.#datos = datos;
  }

  cargar() {
    return this.#datos;
  }

  guardar(datos) {
    this.#datos = datos;
  }
}

export class AlmacenLocal {
  #clave;

  constructor(clave) {
    this.#clave = clave;
  }

  cargar() {
    const guardado = localStorage.getItem(this.#clave);
    return guardado ? JSON.parse(guardado) : null;
  }

  guardar(datos) {
    localStorage.setItem(this.#clave, JSON.stringify(datos));
  }
}

export class AlmacenSesion {
  #clave;

  constructor(clave) {
    this.#clave = clave;
  }

  cargar() {
    const guardado = sessionStorage.getItem(this.#clave);
    return guardado ? JSON.parse(guardado) : null;
  }

  guardar(datos) {
    sessionStorage.setItem(this.#clave, JSON.stringify(datos));
  }
}