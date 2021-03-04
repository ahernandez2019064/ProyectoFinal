'use strict'

const express = require('express');
const app = express();
const bodyparser = require('body-parser');

//MIDDLEWARE
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//Exportar
module.exports = app;