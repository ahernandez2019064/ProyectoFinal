'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const bcrypt = require('bcrypt-nodejs');
var Usuarios = require('./src/modelos/usuarioModel');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/VentaOnline', {useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    var nombreUsuario = 'ADMIN';
    var password = '123456';
    var rol = 'ROL_ADMIN';
    var usuario = new Usuarios();

    usuario.nombreUsuario = nombreUsuario
    usuario.password = password
    usuario.rol = rol

    Usuarios.find({nombreUsuario: usuario.nombreUsuario}).exec((err, usuarioEncontrado)=>{
        if(usuarioEncontrado && usuarioEncontrado.length >= 1){
            console.log('El usuario ADMIN ya fue creado');
        }else{
            bcrypt.hash(usuario.password, null, null, (err, passEncriptada)=>{
                usuario.password = passEncriptada
                usuario.save((err, usuarioGuardado)=>{
                    if(err) console.log('Error en la peticion de Guardar');

                    if(usuarioGuardado){
                        console.log(usuarioGuardado);
                    }else{
                        console.log('No se ha podido registrar el usuario');
                    }
                })
            })
        }
    })

    app.listen(3000, function(){
        console.log('Servidro corriendo correctamente');
    })

}).catch(err => console.log(err))