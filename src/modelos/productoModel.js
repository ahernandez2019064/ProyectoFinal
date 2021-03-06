'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema

var productoSchema = Schema ({
    nompreProducto: String,
    precio: Number,
    cantidad: Number,
    

})