'use strict'

var Factura = require('../modelos/facturaModel');

function agregarFacturas(req, res) {
    var idCarrito = req.params.id;
    

}

function crearFacturas(facturaId) {
    var facturas = new Factura();
    facturas.facturaUsuario = facturaId;
    facturas.save();
}


module.exports = {
    agregarFacturas
}