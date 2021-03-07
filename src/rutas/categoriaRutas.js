'use strict'

var express = require('express');
var categoriaControlador = require('../controladores/categoriaController');

var md_autorizacion = require('../middleware/authentication');

var app = express.Router();

app.post('/agregarCategoria', md_autorizacion.ensureAuth, categoriaControlador.agregarCategoria);
app.put('/editarCategoria/:id', md_autorizacion.ensureAuth, categoriaControlador.editarCategoria);

module.exports = app;