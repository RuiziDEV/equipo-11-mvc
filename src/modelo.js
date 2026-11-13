export const NOTA_MINIMA = 3.0;
export const NOTA_MAXIMA = 5.0;
export const UMBRAL_RIESGO = 4.0;
export const EPS = 1e-9;

export class ErrorDeReglas extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeReglas';
  }
}

export class NotasModelo {
  #evaluaciones;
  #suscriptores = new Set();
  #siguienteId = 1;
  #almacen;

  constructor(almacen) {
    this.#almacen = almacen;
    const cargados = this.#almacen.cargar();
    this.#evaluaciones = cargados ? cargados.map(e => ({ ...e })) : [];
    
    if (this.#evaluaciones.length > 0) {
      this.#siguienteId = Math.max(...this.#evaluaciones.map(e => e.id)) + 1;
    }
  }

  agregar({ nombre, peso, nota = null }) {
    nombre = String(nombre ?? '').trim();
    if (!nombre) throw new ErrorDeReglas('El nombre es obligatorio.');
    if (nombre.length > 40) throw new ErrorDeReglas('El nombre no puede superar 40 caracteres.');
    
    // Parte 5A: Regla nueva de nombres únicos
    if (this.#evaluaciones.some(e => e.nombre.toLowerCase() === nombre.toLowerCase())) {
        throw new ErrorDeReglas('Ya existe una evaluación con ese nombre.');
    }

    peso = Number(peso);
    if (!Number.isFinite(peso) || peso < 1 || peso > 100) {
      throw new ErrorDeReglas('El peso debe estar entre 1 y 100.');
    }

    if (nota !== null && nota !== '') {
      nota = Number(nota);
      if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
        throw new ErrorDeReglas('La nota debe estar entre 0 y 5.');
      }
    } else {
      nota = null;
    }

    const pesosActuales = this.#evaluaciones.reduce((sum, ev) => sum + ev.peso, 0);
    if (pesosActuales + peso > 100) {
      throw new ErrorDeReglas(`Los pesos no pueden sumar más de 100 % (te quedan ${100 - pesosActuales} %).`);
    }

    const id = this.#siguienteId++;
    this.#evaluaciones.push({ id, nombre, peso, nota });
    this.#cambio();
  }

  calificar(id, nota) {
    const evalIndex = this.#evaluaciones.findIndex(e => e.id === id);
    if (evalIndex === -1) throw new ErrorDeReglas('No existe la evaluación.');

    if (nota !== null && nota !== '') {
      nota = Number(nota);
      if (!Number.isFinite(nota) || nota < 0 || nota > 5) {
        throw new ErrorDeReglas('La nota debe estar entre 0 y 5.');
      }
    } else {
      nota = null;
    }

    this.#evaluaciones[evalIndex].nota = nota;
    this.#cambio();
  }

  eliminar(id) {
    const evalIndex = this.#evaluaciones.findIndex(e => e.id === id);
    if (evalIndex === -1) throw new ErrorDeReglas('No existe la evaluación.');
    
    this.#evaluaciones.splice(evalIndex, 1);
    this.#cambio();
  }

  get evaluaciones() {
    return this.#evaluaciones.map(e => ({ ...e }));
  }

  resumen() {
    let pesoCalificado = 0;
    let acumulado = 0;

    for (const ev of this.#evaluaciones) {
      if (ev.nota !== null) {
        pesoCalificado += ev.peso;
        acumulado += (ev.peso * ev.nota) / 100;
      }
    }

    const pesoPendiente = 100 - pesoCalificado;
    let notaNecesaria = null;

    if (pesoPendiente > 0) {
      notaNecesaria = (NOTA_MINIMA - acumulado) / (pesoPendiente / 100);
      if (notaNecesaria < 0) notaNecesaria = 0;
      notaNecesaria = Math.ceil(notaNecesaria * 100) / 100;
    }

    let estado;
    if (acumulado >= NOTA_MINIMA - EPS) {
      estado = 'aprobado';
    } else if (notaNecesaria === null || notaNecesaria > NOTA_MAXIMA) {
      estado = 'imposible';
    } else if (notaNecesaria > UMBRAL_RIESGO) {
      estado = 'en-riesgo';
    } else {
      estado = 'en-camino';
    }

    return { acumulado, pesoCalificado, pesoPendiente, notaNecesaria, estado };
  }

  suscribir(fn) {
    this.#suscriptores.add(fn);
    return () => this.#suscriptores.delete(fn);
  }

  #cambio() {
    this.#almacen.guardar(this.#evaluaciones);
    this.#suscriptores.forEach(fn => fn());
  }
}