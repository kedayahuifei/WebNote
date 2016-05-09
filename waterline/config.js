/**
 * Created by 姜昊 on 2016/5/9.
 */

var mysqlAdapter = require('sails-mysql');
var mongoAdapter =require('sails-mongo');
var adapters={
    mongo:mongoAdapter,
    mysql:mysqlAdapter,
    default:'mongo'
};

var connections ={
    mongo:{
        adapter:'mongo',
        url:"mongodb://localhost/notes"
    },
    mysql:{
        adapter:'mysql',
        url:"mysql://root:haoting521@123.206.70.236/notes"
    }
};
var config = {
    adapters:adapters,
    connections:connections
};
exports.config = config;