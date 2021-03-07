'use strict'

const express = require('express');
const app = express();
const bodyparser = require('body-parser');

//Importaciones
var usuario_route = require('./src/rutas/usuarioRutas');
var categoria_route = require('./src/rutas/categoriaRutas');
var producto_route = require('./src/rutas/productoRutas');

//MIDDLEWARE
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/api', usuario_route, categoria_route, producto_route);

//Exportar
module.exports = app;