/**
 * Created by 姜昊 on 2016/5/9.
 */
var waterline = require('waterline');

var user = waterline.Collection.extend({
    identity:'user',
    connection:'mysql',
    schema:true,
    migrate: 'safe',
    autoCreatedAt:false,
    autoUpdatedAt:false,
    attributes: {
        username: {
            type: 'string',
            required: true
        },
        password: {
            type: 'string',
            required: true
        },
        email: {
            type: 'string'
        },
        createTime: {
            type: 'date'
        },
        beforeCreate: function(value, cb){
            value.createTime =new Date();
            return cb();
        }
    }
});
var note = waterline.Collection.extend({
    identity:'note',
    connection:'mysql',
    schema:true,
    migrate: 'safe',
    autoCreatedAt:false,
    autoUpdatedAt:false,
    attributes: {
        title :{
            type:'string',
        },
        author:{
            type:'string',
        },
        tag   :{
            type:'string',
        },
        content:{
            type:'string',
        },
        createTime:{
            type:'date'
        }
    }
});

exports.user=user;
exports.note=note;