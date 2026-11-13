import { NOTA_MINIMA, NOTA_MAXIMA } from './modelo.js';

export class TermometroVista {
  #el;
  #modelo;

  constructor(raiz, modelo) {
    this.#modelo = modelo;
    
    raiz.innerHTML = `
      <div class="termometro">
        <div class="relleno"></div>
        <div class="linea" style="left: ${(NOTA_MINIMA / NOTA_MAXIMA) * 100}%"></div>
      </div>
      <p class="leyenda"></p>
    `;
    this.#el = {
      relleno: raiz.querySelector('.relleno'),
      leyenda: raiz.querySelector('.leyenda')
    };

    this.#modelo.suscribir(() => this.render());
    this.render();
  }

  render() {
    const res = this.#modelo.resumen();
    const porcentaje = Math.min((res.acumulado / NOTA_MAXIMA) * 100, 100);
    this.#el.relleno.style.width = `${porcentaje}%`;
    this.#el.leyenda.textContent = `${res.acumulado.toFixed(2)} de ${NOTA_MAXIMA.toFixed(1)} · la línea marca el mínimo para aprobar (${NOTA_MINIMA.toFixed(1)})`;
  }
}