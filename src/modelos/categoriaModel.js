'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema ({
    nombreCategoria: String,
    descripcion: String
})

module.exports = mongoose.model('categorias', CategoriaSchema);