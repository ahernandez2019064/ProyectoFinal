'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CarritoSchema = Schema({
    listaProductos:[{
        nombre: String,
        precio: String,
        cantidad: Number,
        subTotal: Number,
        producto: {type: Schema.ObjectId, ref: 'productos'}
    }],
    carritoUsuario: {type: Schema.Types.ObjectId, ref: 'usuarios'},
    total: Number
})

module.exports = mongoose.model('carritos', CarritoSchema);