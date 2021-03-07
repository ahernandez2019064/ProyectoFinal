'use Strict'

var express = require('express');
var productoControlador = require('../controladores/productosController');

var md_autorizacion = require('../middleware/authentication');

var app = express.Router();

app.post('/agregarProducto/:id', md_autorizacion.ensureAuth, productoControlador.agregarProducto);

module.exports = app;