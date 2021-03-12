'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FacturaSchema = Schema ({
    listaProductos:[{
        nombre:String,
        precio: String,
        cantidad: Number,
        subTotal: Number,
        producto: {type: Schema.ObjectId, ref: 'productos'}
    }],
    facturaUsuario: {type: Schema.Types.ObjectId, ref: 'usuarios'},
    total: Number
});

module.exports = mongoose.model('facturas', FacturaSchema);