/**
 * Created by 姜昊 on 2016/3/19.
 */
var express     = require("express"),
    session     = require('express-session'),
    path        = require('path'),
    bodyParser  = require('body-parser'),
    moment      = require('moment'),
    checkLogin  = require('./checkLogin.js');
    crypto      = require('crypto');

var mongoose   = require("mongoose");

var models     = require("./models/models");


var loginError =100;
var User       = models.User;
var Note       = models.Note;
mongoose.connect('mongodb://127.0.0.1:27017/notes');
mongoose.connection.on('error',console.error.bind(console,'connect db failed'));

var app = express();

if(typeof errorCode == "undefined"){
    var errorCode = {
        errorCode1: 101,
        errorCode2: 102,
        errorCode3: 103,
        errorCode4: 104
    }
}
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));


app.use(session({
        secret:'1234',
        name:'mynote',
        cookie:{maxAge :1000*60*20},
        resave :false,
        saveUninitialized :true
}));

app.get('/',checkLogin.noLogin);
app.get('/',function(req,res){
        Note.find({author:req.session.user.username})
            .exec(function(err,allNotes){
                if(err){
                    console.log(err);
                    return res.redirect('login');
                }
                res.render('index',{
                    title: '首页',
                    user :req.session.user,
                    notes :allNotes
                });
            });
});
app.get('/noteList',function(req,res){
    Note.find({author:req.session.user.username})
        .exec(function(err,allNotes){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            res.render('noteList',{
                title: '文章列表',
                user :req.session.user,
                notes :allNotes
            });
        });
});


app.get('/register',checkLogin.haveLogin);
app.get('/register',function(req,res){
    res.render('register',{
        user :req.session.user,
        title: '注册'
    });
});
app.post('/checkUsername',function(req,res){
    var username = req.body.user;

    console.log(username);
    User.findOne({username:username},function(err,user) {
        if (err) {
            console.log(err);
            return res.redirect('/register');
        }
        if (user) {
            console.log('user exit');
            res.write("用户名已存在");
            res.end();
        }else{
            res.write("default");
            res.end();
        }

    });
});
app.post('/register',function(req,res){
    var username = req.body.username,
        password = req.body.password,
        passwordRepeat = req.body.passwordConfirm;

    if(username.trim().length == 0){
        console.log("username connot be empty");
        return res.redirect('/register');
    }

    if(password.trim().length == 0||passwordRepeat.trim().length ==0){
        console.log("password connot be empty");
        return res.redirect('/register');
    }
    if(password != passwordRepeat){
        console.log("confirm password wrong");
        return res.redirect('/register');
    }
    User.findOne({username:username},function(err,user){
        if(err){
            console.log(err);
            return res.redirect('/register');
        }
        if(user){
            console.log('username exit');
            return res.redirect('/register');
        }
        var md5 = crypto.createHash('md5'),
            md5Password = md5.update(password).digest('hex');

        var newUser  = new User({
                        username:username,
                        password:password
                        });

        newUser.save(function(err,doc){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            req.session.user = newUser;
            console.log('register success');
            return res.redirect('/');
        });

    });

});

app.get('/login',checkLogin.haveLogin);
app.get('/login',function(req,res){
    res.render('login',{
        error:loginError,
        user :req.session.user,
        title: '登录'
    });
    loginError =100;
});

app.post('/loginCheck',function(req,res){
    var username = req.body.username,
        password = req.body.password;

    User.findOne({username:username},function(err,user){
        if(err){
            console.log('err');
            return res.redirect('/login');
        }
        if(!user){
            console.log('user not exit');
            res.write("用户名不存在");
            res.end();
        }else{
            var md5 = crypto.createHash('md5'),
                md5Password = md5.update(password).digest('hex');
            if(user.password != password){
                console.log('wrong passwrod');
                res.write("密码不正确");
                res.end();
            }else{
                res.write("success");
                res.end();
            }
        }
    });
});
app.post('/login',function(req,res){
    var username = req.body.username,
        password = req.body.password;

    User.findOne({username:username},function(err,user){
        if(err){
            console.log('err');
            return res.redirect('/login');
        }
        if(!user){
            console.log('user not exit');
            loginError = 101;
            return res.redirect('/login');
        }
        var md5 = crypto.createHash('md5'),
            md5Password = md5.update(password).digest('hex');
        if(user.password != password){
            console.log('wrong passwrod');
            loginError = 102;
            return res.redirect('/login');
        }
        console.log('login success');
        if(req.body.freeLogin){
            res.cookie('isFreeLogin', true, {maxAge: 1000*60*60*24*7});
            res.cookie('user', user, {maxAge: 1000*60*60*24*7});
        }
        user.password = null;
        delete user.password;
        req.session.user = user;
        return res.redirect('/');

    });
});

app.get('/quit',function(req,res){
    req.session.user =null;
    res.cookie('isFreeLogin', null, {maxAge: 0});
    res.cookie('user', null, {maxAge:0});
    res.redirect('/login');
});

app.get('/post',checkLogin.noLogin);
app.get('/post',function(req,res){
    res.render('post',{
        user : req.session.user,
        title: '发布'
    });
});
app.post('/post',function(req,res){
    console.log("post post");
    var note  = new Note({
                title : req.body.notetitle,
                author : req.session.user.username,
                tag : req.body.notetag,
                content: req.body.content
                });

    note.save(function(err,doc){
        if(err){
            console.log(err);
            return res.redirect('/post');
        }
        console.log('note post success');
        return res.redirect('/');
    })
});
app.get('/detail/:_id',function(req,res){
    console.log('查看笔记');
    Note.findOne({_id: req.params._id})
        .exec(function(err,art){
            if(err){
                console.log(err);
                return res.redirect('/');
            }
            if(art){
                res.render('note',{
                    title :'笔记详情',
                    user : req.session.user,
                    art : art,
                    moment :moment
                })
            }
         });
});
app.get('/detail',function(req,res){
    res.render('index',{
        user : req.session.user,
        title: '查看笔记'
    });
});

app.listen(5000,function(request , response){
    console.log("app is running at port 5000");
});