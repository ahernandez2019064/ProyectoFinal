'use strict'

var express = require('express');
var usuarioControlador = require('../controladores/usuarioController');

var md_autorizacion = require('../middleware/authentication');

var app = express.Router();

app.post('/login', usuarioControlador.login);
app.post('/registrarCliente', usuarioControlador.registrarCliente);
app.post('/registrarAdmin', md_autorizacion.ensureAuth ,usuarioControlador.registrarAdmin);
app.delete('/eliminarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.eliminarUsuario);
app.put('/editarUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.editarUsuario);
app.put('/ascenderUsuario/:id', md_autorizacion.ensureAuth, usuarioControlador.ascenderUsuario);

module.exports = app;