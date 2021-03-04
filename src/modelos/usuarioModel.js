'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var usuarioSchema = Schema({
    nombreUsuario: String,
    password: String,
    rol: String
});

module.exports = mongoose.model('usuarios', usuarioSchema);