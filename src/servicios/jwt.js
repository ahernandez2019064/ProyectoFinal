'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
var secret = 'Venta_Online'

exports.createToken = function (usuarios){
    var payload = {
        sub: usuarios._id,
        nombreUsuario: usuarios.nombreUsuario,
        password: usuarios.password,
        rol: usuarios.rol,
        iat: moment().unix(),
        exp: moment().day(10, 'days').unix()
    }

    return jwt.encode(payload, secret);
}
