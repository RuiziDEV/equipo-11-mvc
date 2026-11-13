import { NotasModelo } from './modelo.js';
import { NotasVista } from './vista.js';
import { NotasControlador } from './controlador.js';
import { AlmacenSesion } from './almacen.js';
import { TermometroVista } from './termometro-vista.js';

// Usamos AlmacenSesion en lugar de AlmacenLocal
const modelo = new NotasModelo(new AlmacenSesion('notas.v1'));

// Inicializamos las vistas
const vista = new NotasVista(document.getElementById('app'), modelo);
new TermometroVista(document.getElementById('termometro'), modelo);

// Inicializamos el controlador
new NotasControlador(modelo, vista);