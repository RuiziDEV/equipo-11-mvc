export class NotasVista {
  #el;
  #modelo;

  constructor(raiz, modelo) {
    this.#modelo = modelo;
    this.#el = {
      formulario: raiz.querySelector('#agregar-form'),
      tabla: raiz.querySelector('#tabla-evaluaciones tbody'),
      vacio: raiz.querySelector('#vacio'),
      acumulado: raiz.querySelector('#acumulado'),
      pesoCalificado: raiz.querySelector('#peso-calificado'),
      pesoPendiente: raiz.querySelector('#peso-pendiente'),
      necesaria: raiz.querySelector('#necesaria'),
      estado: raiz.querySelector('#estado'),
      error: raiz.querySelector('#error-mensaje')
    };

    this.#modelo.suscribir(() => this.render());
    this.render();
  }

  alAgregar(manejador) {
    this.#el.formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      manejador(this.leerFormulario());
    });
  }

  alEliminar(manejador) {
    this.#el.tabla.addEventListener('click', (evento) => {
      const boton = evento.target.closest('button[data-eliminar]');
      if (boton) manejador(Number(boton.dataset.eliminar));
    });
  }

  alCalificar(manejador) {
    this.#el.tabla.addEventListener('change', (evento) => {
      if (evento.target.matches('input[data-nota]')) {
        const id = Number(evento.target.dataset.nota);
        const nota = evento.target.value === '' ? null : Number(evento.target.value);
        manejador(id, nota);
      }
    });
  }

  leerFormulario() {
    const formData = new FormData(this.#el.formulario);
    return {
      nombre: formData.get('nombre'),
      peso: formData.get('peso'),
      nota: formData.get('nota')
    };
  }

  limpiarFormulario() {
    this.#el.formulario.reset();
    this.#el.formulario.elements.nombre.focus();
  }

  mostrarError(mensaje) {
    this.#el.error.textContent = mensaje;
    this.#el.error.hidden = false;
  }

  limpiarError() {
    this.#el.error.textContent = '';
    this.#el.error.hidden = true;
  }

  render() {
    const evs = this.#modelo.evaluaciones;
    const res = this.#modelo.resumen();

    this.#el.tabla.innerHTML = '';
    this.#el.vacio.hidden = evs.length > 0;

    evs.forEach(ev => {
      const fila = document.createElement('tr');
      
      const celdaNombre = document.createElement('td');
      celdaNombre.textContent = ev.nombre;
      
      const celdaPeso = document.createElement('td');
      celdaPeso.textContent = `${ev.peso} %`;
      
      const celdaNota = document.createElement('td');
      const inputNota = document.createElement('input');
      inputNota.type = 'number';
      inputNota.step = '0.1';
      inputNota.min = '0';
      inputNota.max = '5';
      inputNota.dataset.nota = ev.id;
      inputNota.value = ev.nota !== null ? ev.nota : '';
      celdaNota.appendChild(inputNota);
      
      const celdaAporte = document.createElement('td');
      celdaAporte.textContent = ev.nota !== null ? ((ev.peso * ev.nota) / 100).toFixed(2) : '—';
      
      const celdaBoton = document.createElement('td');
      const btnEliminar = document.createElement('button');
      btnEliminar.dataset.eliminar = ev.id;
      btnEliminar.textContent = 'Eliminar';
      celdaBoton.appendChild(btnEliminar);

      fila.append(celdaNombre, celdaPeso, celdaNota, celdaAporte, celdaBoton);
      this.#el.tabla.appendChild(fila);
    });

    this.#el.acumulado.textContent = res.acumulado.toFixed(2);
    this.#el.pesoCalificado.textContent = `${Math.round(res.pesoCalificado * 100) / 100} %`;
    this.#el.pesoPendiente.textContent = `${Math.round(res.pesoPendiente * 100) / 100} %`;
    this.#el.necesaria.textContent = res.notaNecesaria !== null ? res.notaNecesaria.toFixed(2) : '—';
    
    this.#el.estado.className = `estado ${res.estado === 'aprobado' ? 'ok' : res.estado === 'imposible' ? 'imposible' : res.estado === 'en-riesgo' ? 'riesgo' : 'en-camino'}`;
    
    const textosEstado = {
      'aprobado': '¡Aprobado! Ya aseguraste la nota mínima.',
      'en-camino': `En camino: necesitas ${res.notaNecesaria?.toFixed(2)} en lo que falta.`,
      'en-riesgo': `En riesgo: necesitas ${res.notaNecesaria?.toFixed(2)} en lo que falta.`,
      'imposible': 'Imposible aprobar con las notas actuales.'
    };
    this.#el.estado.textContent = textosEstado[res.estado];
  }
}