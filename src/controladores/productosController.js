'use Strict'

var Producto = require('../modelos/productoModel');

function agregarProducto(req, res) {
    var productos = new Producto();
    var params = req.body;
    var idCategoria = req.params.id

    if(req.user.rol === 'ROL_ADMIN'){
        if(params.nombreProducto && params.precio && params.cantidad){
            productos.nombreProducto = params.nombreProducto;
            productos.precio = params.precio;
            productos.cantidad = params.cantidad;
            productos.categoria = idCategoria; 

            Producto.find({nombreProducto: productos.nombreProducto}).exec((err, productoAgregado)=>{
                if(err) return res.status(500).send({ mensaje: 'Error en la peticion de agregar' });
                if(productoAgregado && productoAgregado.length >= 1){
                    return res.status(500).send({ mensaje: 'El producto '+params.nombreProducto+' ya existe' });
                }else{
                    productos.save((err, productoGuardado)=>{
                        if(err) return res.status(500).send({ mesnaje: 'Error al guardar el producto' });
                        if(productoGuardado){
                            return res.status(200).send({ productoGuardado });
                        }else{
                            return res.status(500).send({ mensaje: 'No se ha podido agregar el producto' });
                        }
                    })
                }
            })
        }
    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar esta accion' })
    }
}

module.exports = {
    agregarProducto
}