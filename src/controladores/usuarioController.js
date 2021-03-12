'use strict'

var Usuarios = require('../modelos/usuarioModel');
var Carrito = require('../modelos/carritoModel');
var Factura = require('../modelos/facturaModel');
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
                        if(usuarioEncontrado.rol === 'ROL_ADMIN'){
                            return res.status(200).send({
                                token: jwt.createToken(usuarioEncontrado)
                            })
                        }else if(usuarioEncontrado.rol === 'ROL_CLIENTE'){
                            Factura.find({ facturaUsuario: usuarioEncontrado }, (err, facturasCompras)=>{
                                if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' })
                                if(facturasCompras.length == 0){
                                    return res.status(500).send({
                                        token: jwt.createToken(usuarioEncontrado), mensaje: 'Aun no has realizado compras :c ' 
                                    })
                                }
                
                                return res.status(200).send({
                                    token: jwt.createToken(usuarioEncontrado), facturasCompras 
                                })
                            })
                        }
                        
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

function registrarAdmin(req, res){
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
    carritos.total = 0;
    carritos.save();
}

function agregarProductoCarrito(req, res) {
    var params = req.body
    var idProducto = req.params.id
    var idUsuario = req.user.sub

    if(req.user.rol != 'ROL_CLIENTE') return res.status(500).send({ mensaje: 'No posee los permisos para agregar productod' });

    Producto.findById(idProducto).exec((err, productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' });

        if(productoEncontrado.cantidad < params.cantidad) return res.status(500).send({ mensaje: `No hay productos suficientes lo maximo que puede escoger es ${productoEncontrado.cantidad}` });
        if(!productoEncontrado) return res.status(500).send({ mensaje: 'Error al buscar el producto' });
        if (productoEncontrado.cantidad == 0) return res.status(500).send({mensaje:'No hay productos en existencia'});

        var parametroInt = parseInt(params.cantidad,10);
        var precio = productoEncontrado.precio;
        var subTotalF = parametroInt * precio;
        precio = parseInt(precio, 10);

        Carrito.findOne({carritoUsuario: idUsuario, "listaProductos.producto": idProducto}, (err, productoCarrito)=>{
            if(err) return res.status(500).send({ mensaje: 'Error al querer encontrar el producto' });
            if(!productoCarrito){
                Carrito.findOneAndUpdate({ carritoUsuario: idUsuario }, {$push: {listaProductos: {nombre: productoEncontrado.nombreProducto, precio: productoEncontrado.precio , cantidad: parametroInt, precio:  productoEncontrado.precio, subTotal: subTotalF, producto: idProducto}}},
                {new: true, useFindAndModify:false}, (err, productoGuardado)=>{
                    if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
                    if(!productoGuardado) return res.status(500).send({ mensaje: 'Error al ingresar los datos' });
                        var totalFinal = parseInt(productoGuardado.total, 10);
                        var parametroInt = parseInt(params.cantidad, 10);

                        Carrito.findOneAndUpdate({carritoUsuario: req.user.sub, "listaProductos.producto": idProducto}, {total: totalFinal+(precio*parametroInt)}, {new: true}, (err, carritoActualizado)=>{
                            return res.status(200).send({ Carrito: carritoActualizado });
                        })
                })
            }else{
                var array = productoCarrito.listaProductos;
                                
                for (let casilla = 0; casilla < array.length; casilla ++){
                    var stockArray = array[casilla].cantidad;
                    var subTotaFlArray = array[casilla].subTotal;
                    var productoIdArray = array[casilla].producto;
                    
                    if (req.params.id == productoIdArray) {
                        array.forEach(function(objeto){
                        if (objeto.producto == idProducto){
                            Carrito.findOneAndUpdate({carritoUsuario: req.user.sub, "listaProductos.producto" : idProducto},
                            {"listaProductos.$.cantidad":parametroInt+stockArray,"listaProductos.$.subTotal":subTotaFlArray+subTotalF},(err, productoAgregado) =>{
                            if (err) return res.status(500).send({mensaje:'Error en la peticion'});
                            if (!productoAgregado) return res.status(500).send({mensaje:'Error al ingresar los datos'});
                                var total = parseInt(productoAgregado.total,10);
                                var integerParam = parseInt(params.cantidad,10);
                                Carrito.findOneAndUpdate({carritoUsuario:req.user.sub, "listaProductos.producto":idProducto},{total:total+(precio*integerParam)},
                                {new:true},(err,carritoActualizado) => { return res.status(200).send({carritoActualizado});})
                            })
                        }
                        })
                    }else{
                        console.log('error')
                    }
                }
            }
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

function productosAgotados(req, res) {

    if(req.user.rol != 'ROL_ADMIN') return res.status(500).send({ mensaje: 'No posee los permisos para realizar esta accion' })
        Producto.find({cantidad: 0} , (err, productosVacios)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' });
            if(!productosVacios) return res.status(500).send({ mensaje: 'Todos los productos tienen existencias' })
            
            return res.status(200).send({ productosVacios });
        })
}

function generarFactura(req, res) {
    var facturas = new Factura();

    if(req.user.rol != 'ROL_CLIENTE') return res.status(500).send({ mensaje: 'No posee los permisos para realizar esta accion' })
    Carrito.findOne({carritoUsuario: req.user.sub}, (err, carritoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' })
        if(!carritoEncontrado) return res.status(500).send({ mensaje: 'No se ha podido encontrar el cliente' })

        facturas.total = carritoEncontrado.total;
        facturas.listaProductos = carritoEncontrado.listaProductos;
        facturas.facturaUsuario = carritoEncontrado.carritoUsuario;

        facturas.save((err, facturaGuardada)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de guardar' });

            var arrayProductos = carritoEncontrado.listaProductos
            arrayProductos.forEach(function(elemento){
                Producto.findById(elemento.producto, (err, productosEncontrados)=>{
                    if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' });
                    if(!productosEncontrados) return res.status(500).send({ mensjae: 'No se ha podido encontrar el producto' });
                    

                    Producto.findByIdAndUpdate(elemento.producto, {cantidad: productosEncontrados.cantidad - elemento.cantidad, cantidadVendida: productosEncontrados.cantidadVendida + elemento.cantidad}, (err, productoActualizado)=>{ })
                })
            }) 

            Carrito.findOneAndUpdate({carritoUsuario: req.user.sub}, {$set:{listaProductos:[]}, total: 0}, (err, vaciarCarrito)=>{ 
            });

            if(facturaGuardada){
                return res.status(500).send({ facturaGuardada })
            }
        });
    })
}

function facturasUsuarios(req, res){
    if(req.user.rol === 'ROL_ADMIN'){
        Factura.find( (err, facturasCompras)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' })
            if(facturasCompras.length == 0){
                return res.status(500).send({ mensaje: 'Aun no has realizado compras :c ' })
            }

            return res.status(200).send({ facturasCompras })
        })
    }else{
        return res.status(500).send({ mensaje: 'Solo los clientes pueden realizar sus compras y visializarlas' })
    }
}

function productosFacturas(req, res) {
    var idFactura = req.params.id

    if(req.user.rol != 'ROL_ADMIN') return res.status(500).send({ mensaje: 'Usted no posee los permiso para realizar esta accion' });

    Factura.find({ _id: idFactura },{ "listaProductos.nombre": 1, "listaProductos.precio": 1, "listaProductos.cantidad": 1 , "listaProductos.subTotal": 1} , (err, facturaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de busqueda' });
        if(!facturaEncontrada) return res.status(500).send({ mensaje: 'No se ha podido encontrar la factura' })
                    
        return res.status(200).send({ facturaEncontrada });
    })
            


    
}

function productosMasVendidos(req, res){
    Producto.find({},(err, productosEncontrados)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion de la busqueda' })
        if(!productosEncontrados) return res.status(500).send({ mensaje: 'No se ha podido realizar la busqueda' })

        return res.status(200).send({ productosEncontrados });
    }).sort({cantidadVendida: -1}).limit(3);
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
    productosXCategoria,
    productosAgotados,
    generarFactura,
    facturasUsuarios,
    productosFacturas,
    productosMasVendidos
}