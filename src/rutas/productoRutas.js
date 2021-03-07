'use Strict'

var express = require('express');
var productoControlador = require('../controladores/productosController');

var md_autorizacion = require('../middleware/authentication');

var app = express.Router();

app.post('/agregarProducto/:id', md_autorizacion.ensureAuth, productoControlador.agregarProducto);
app.put('/editarProducto/:id', md_autorizacion.ensureAuth, productoControlador.editarProducto);
app.delete('/eliminarProducto/:id', md_autorizacion.ensureAuth, productoControlador.eliminarProducto);

module.exports = app;