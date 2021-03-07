'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema

var productoSchema = Schema ({
    nombreProducto: String,
    precio: Number,
    cantidad: Number,
    cantidadVendida: Number, 
    categoria: {type: Schema.Types.ObjectId, ref: 'categorias'}
})

module.exports = mongoose.model('productos', productoSchema);