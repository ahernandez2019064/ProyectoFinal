'use strict'

var Usuarios = require('../modelos/usuarioModel');
var Carrito = require('../modelos/carritoModel');
var Producto = require('../modelos/productoModel');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../servicios/jwt');
const { findByIdAndUpdate } = require('../modelos/usuarioModel');

// CRUD ADMINISTRADOR
function login(req, res){
    var params = req.body

    Usuarios.findOne({ nombreUsuario: params.nombreUsuario }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la petición' });

        if(usuarioEncontrado){
            bcrypt.compare(params.password, usuarioEncontrado.password, (err, passVerifacada)=>{
                if(passVerifacada){
                    if(params.getToken === 'true'){
                        return res.status(200).send({
                            token: jwt.createToken(usuarioEncontrado)
                        })
                    }else{
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuarioEncontrado });
                    }
                }else{
                    return res.status(500).send({mensaje: 'El usuario no se ha podido verificar'});
                }
            });
        }else{
            return res.status(500).send({mensaje: 'No se ha podido encontrar su usuario :( '});
        }
    })
}

function registrarCliente(req, res){
    var usuario = new Usuarios();
    var params = req.body;

    if(params.nombreUsuario && params.password){
        usuario.nombreUsuario = params.nombreUsuario;
        usuario.password = params.password;
        usuario.rol = 'ROL_CLIENTE';

        Usuarios.find({nombreUsuario: usuario.nombreUsuario}).exec((err, usuarioEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de registro' });
            if(usuarioEncontrado && usuarioEncontrado.length >= 1){
                return res.status(500).send({ mensaje: 'El usuario '+ params.nombreUsuario + ' ya existe' });
            }else{
                bcrypt.hash(params.password, null, null, (err, passVerifacada)=>{
                    usuario.password = passVerifacada;

                    usuario.save((err, usuarioGuardado)=>{
                        if(err) return res.status(500).send({ mensaje: 'Error al guardar el usuario' });

                        if(usuarioGuardado){
                            return res.status(200).send({ usuarioGuardado });
                        }else{
                            return res.status(500).send({ mensaje: 'No se ha podido regstrar este usuario' });
                        }
                    })
                })
            }
        })
    }
}

function registrarAdmin(req, res) {
    var params = req.body;
    var usuario = new Usuarios();

    if(params.nombreUsuario && params.password){
        usuario.nombreUsuario = params.nombreUsuario;
        usuario.password = params.password;
        usuario.rol = params.rol;

        Usuarios.find({nombreUsuario: usuario.nombreUsuario}).exec((err, usuarioRegistrado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de registro' });
            if(usuarioRegistrado && usuarioRegistrado.length>=1){
                return res.status(500).send({ mensaje: 'El usuario'+params.nombreUsuario+'ya existe' });
            }else{
                if(params.rol === 'ROL_ADMIN' || params.rol === 'ROL_CLIENTE'){
                    bcrypt.hash(params.password, null, null, (err, passVerifacada)=>{
                        usuario.password = passVerifacada;
    
                        usuario.save((err, usuarioGuardado)=>{
                            if(err) return res.status(500).send({ mensaje: 'Error al guardar el usuario' });
    
                            if(usuarioGuardado){
                                return res.status(200).send({ usuarioGuardado });
                            }else{
                                return res.status(500).send({ mensaje: 'No se ha podido registrar el usuario' });
                            }
                        })
                    })
                }else{
                    return res.status(500).send({ mensaje: 'Por favor ingresar el rol como "ROL_ADMIN" o "ROL_CLIENTE"' })
                }
            }
        })
    }
}

function eliminarUsuario(req, res) {
    if(req.user.rol === 'ROL_ADMIN'){
        var idUsuario = req.params.id;

        Usuarios.findOneAndDelete({_id:idUsuario, rol: 'ROL_CLIENTE'}, (err, usuarioEliminado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de elimincion' });
            if(!usuarioEliminado) return res.status(500).send({ mensaje: 'No se pueden eliminar Administradores' });

            return res.status(200).send({ mensaje: 'El usuario ha sido eliminado' })
        })
    }
}

function editarUsuario(req, res) {
    var idUsuario = req.params.id;
    var params = req.body;

    if(req.user.rol === 'ROL_ADMIN'){
        delete params.password;
        if(params.rol === 'ROL_ADMIN' || params.rol === 'ROL_CLIENTE'){
            Usuarios.findOneAndUpdate({_id: idUsuario, rol: 'ROL_CLIENTE'}, params, {new: true}, (err, usuarioEditado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la petición de editar' });
            if(!usuarioEditado) return res.status(500).send({ mensaje: 'No se pueden editar Usuarios Admin' });

            return res.status(200).send({ usuarioEditado })
            })
        }else{
            return res.status(500).send({ mensaje: 'Por favor ingresar el rol como "ROL_ADMIN" o "ROL_CLIENTE"' })
        }
        
    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar esta accion' });
    }

}

function ascenderUsuario(req, res) {
    var idUsuario = req.params.id;
    var params = req.body;

    if(req.user.rol === 'ROL_ADMIN'){
        delete params.password;

        Usuarios.findOneAndUpdate({_id: idUsuario, rol: 'ROL_CLIENTE'},{rol: params.rol}, {new: true}, (err, ascensoRealizado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la petición de asceder' });
            if(!ascensoRealizado) return res.status(500).send({ mensaje: 'No se pueden ascender Usuarios Admin' });

            return res.status(200).send({ ascensoRealizado, mensaje: 'El usuario ha sido ascendido' });
        })
        
    }else{
        return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar esta acción' })
    }
}

// CRUD CLIENTE
function registrarCliente(req, res){
    var usuario = new Usuarios();
    var params = req.body;

    if(params.nombreUsuario && params.password){
        usuario.nombreUsuario = params.nombreUsuario;
        usuario.password = params.password;
        usuario.rol = 'ROL_CLIENTE';

        Usuarios.find({nombreUsuario: usuario.nombreUsuario}).exec((err, usuarioEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de registro' });
            if(usuarioEncontrado && usuarioEncontrado.length >= 1){
                return res.status(500).send({ mensaje: 'El usuario '+ params.nombreUsuario + ' ya existe' });
            }else{
                bcrypt.hash(params.password, null, null, (err, passVerifacada)=>{
                    usuario.password = passVerifacada;

                    usuario.save((err, usuarioGuardado)=>{
                        if(err) return res.status(500).send({ mensaje: 'Error al guardar el usuario' });

                        if(usuarioGuardado){
                            crearCarritos(usuarioGuardado._id);
                            return res.status(200).send({ usuarioGuardado });
                        }else{
                            return res.status(500).send({ mensaje: 'No se ha podido regstrar este usuario' });
                        }
                    })
                })
            }
        })
    }
}

function eliminarCuenta(req, res) {
    var idUsuario = req.params.id

    if(idUsuario != req.user.sub){
        return res.status(500).send({mensaje:'No posee los permisos para eliminar este usuario'});
    }

    Usuarios.findByIdAndDelete({_id: idUsuario}, (err, clienteEliminado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar' });
        if(!clienteEliminado) return res.status(500).send({ mensaje: 'No se ha podido eliminar su cuenta' });

        return res.status(200).send({ mensaje: 'El usuario ha sido eliminado' })
    })
}

function editarCuenta(req, res) {
    var idUsuario = req.params.id
    var params = req.body

    delete params.rol;

    if(idUsuario != req.user.sub){
        return res.status(500).send({ mensaje: 'No posee los permisos para editar esta cuenta' });
    }

    Usuarios.findByIdAndUpdate({_id: idUsuario}, {new: true}, params, (err, usuarioEditado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion para eliminaar' });
        if(!usuarioEditado) return res.status(500).send({ mensaje: 'No se ha podido editar el usuario' });

        return res.status(200).send({ usuarioEditado })
    })
}

function crearCarritos(usuarioId) {
    var carritos = new Carrito();
    carritos.carritoUsuario = usuarioId;
    carritos.save();
}

function agregarProductoCarrito(req, res) {
    var params = req.body
    var idProducto = req.params.id
    var idUsuario = req.user.sub

    if(req.user.rol != 'ROL_CLIENTE'){
        return res.status(500).send({ mensaje: 'No posee los permisos para agregar productod' });
    }

    Producto.findById(idProducto).exec((err, productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' });
        if(productoEncontrado.cantidad < params.cantidad) return res.status(500).send({ mensaje: `No hay productos suficientes lo maximo que puede escoger es ${productoEncontrado.cantidad}` });
        if(!productoEncontrado) return res.status(500).send({ mensaje: 'Error al buscar el producto' });
        if (productoEncontrado.cantidad == 0) return res.status(500).send({mensaje:'No hay prodctos en existencias'});

        var precio = productoEncontrado.precio;
        var subTotalF = params.cantidad * productoEncontrado.precio;

        Carrito.findOneAndUpdate({ carritoUsuario: idUsuario }, {$push: {listaProductos: {cantidad: params.cantidad, subTotal: subTotalF, producto: idProducto}}},
            {new: true, useFindAndModify:false}, (err, productoGuardado)=>{
                if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                if(!productoGuardado) return res.status(500).send({ mensaje: 'Error al ingresar los datos' });


                var total = productoGuardado.total;
                var parametroInt = parseInt(params.cantidad,10);
                
                Producto.findByIdAndUpdate(idProducto,{cantidad:productoEncontrado.cantidad-params.cantidad,cantidadVendida:productoEncontrado.cantidadVendida+parametroInt},
                    (err, productoActualizado) =>{      })
                Carrito.findOneAndUpdate({usuarioCarrito:idUsuario},{total:total+(precio*params.cantidad)},{new:true},(err,actualizado) => { 
                    return res.status(200).send({CARRITO:actualizado});})
            })

    })

}

function obtenerProductosNombre(req, res) {
    var params = req.body

    if(req.user.sub === 'ROL_CLIENTE') return res.status(500).send({ mensaje: 'Usted no posee los permisos para realizar esta accion' });
    Producto.find({ nombreProducto: params.nombreProducto} , (err, productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(!productoEncontrado) return res.status(500).send({mensaje: 'Error al obtener el Producto' });

        return res.status(200).send({ productoEncontrado });
    })
}

function productosXCategoria(req, res) {
    var idCategoria = req.params.id;

    if(req.user.rol != 'ROL_CLIENTE') return res.status(500).send({ mensaje: 'No posee los permisos para realizar esta accion' })

    Producto.find({ categoria: idCategoria }, (err, productosEncontrados)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' });
        if(!productosEncontrados) return res.status(500).send({ mensaje: 'No se ha podido encontrar los productos' });

        return res.status(200).send({ productosEncontrados });
    })
}




module.exports = {
    login,
    registrarCliente,
    registrarAdmin,
    eliminarUsuario,
    editarUsuario,
    ascenderUsuario,
    eliminarCuenta,
    editarCuenta,
    agregarProductoCarrito,
    obtenerProductosNombre,
    productosXCategoria
}