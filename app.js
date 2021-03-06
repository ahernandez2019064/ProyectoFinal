'use strict'

const express = require('express');
const app = express();
const bodyparser = require('body-parser');

//Importaciones
var usuario_route = require('./src/rutas/usuarioRutas');

//MIDDLEWARE
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/api', usuario_route);

//Exportar
module.exports = app;