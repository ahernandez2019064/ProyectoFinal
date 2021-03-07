'use Strict'

var Producto = require('../modelos/productoModel');
var Categoria = require('../modelos/categoriaModel');

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

function editarProducto(req, res) {
    var idProducto = req.params.id;
    var params = req.body;

    if(req.user.rol === 'ROL_ADMIN'){
        Categoria.findById(params.categoria, (err, idVerificada)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la verifiacacion de Id' });
            if(!idVerificada) return res.status(404).send({ mensaje: 'Este ID no existe' });
        })

        Producto.findByIdAndUpdate(idProducto, params, {new: true} , (err, productoEditado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error al editar el producto' });
            if(!productoEditado) return res.status(500).send({ mensaje: 'No se ha podido editar el producto' });

            return res.status(200).send({ productoEditado });
        })

    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar esta accion' });
    }
    
}

function eliminarProducto(req, res) {
    var idProducto = req.params.id;

    if(req.user.rol === 'ROL_ADMIN'){
        Producto.findByIdAndDelete(idProducto, (err, productoEliminado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar' });
            if(!productoEliminado) return res.status(500).send({ mensaje: 'Mo se ha podido eliminar' });

            return res.status(200).send({ productoEliminado });
        })
    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar la accion' });
    }
}

module.exports = {
    agregarProducto,
    editarProducto,
    eliminarProducto
}