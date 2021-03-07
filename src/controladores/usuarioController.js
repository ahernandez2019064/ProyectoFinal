'use strict'

var Usuarios = require('../modelos/usuarioModel');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../servicios/jwt');

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




module.exports = {
    login,
    registrarCliente,
    registrarAdmin,
    eliminarUsuario,
    editarUsuario,
    ascenderUsuario
}