'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'Venta_Online';

exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){
        return res.status(500).send({ mensaje: 'La peticion no tiene la cabecera de Autenticacion' });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try{
        var payload = jwt.decode(token, secret);
        if(payload.exp <= moment().unix()){
            return res.status(401).send({ mensaje: 'El token ya a expirado' });
        }
    }catch(err){
        return res.status(404).send({ mensaje:'El token no es valido' })
    }

    req.user = payload;
    next();

}