/**
 * Created by 姜昊 on 2016/5/9.
 */
var waterline= require('waterline');
var user = require('./collections').user;
var note = require('./collections').note;

var orm = new waterline();
orm.loadCollection(user);
orm.loadCollection(note);
exports.orm = orm;