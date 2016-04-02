/**
 * Created by 姜昊 on 2016/3/29.
 */
function noLogin(req,res,next){
    if(!req.session.user){
        console.log('抱歉，你还没有登录');
        return res.redirect('/login');
    }
    next();
}
function haveLogin(req,res,next){
    if(req.cookies.isFreeLogin==true){
        console.log(req.cookies.isFreeLogin);
        console.log(req.cookies.user.username);
        req.session.user = req.cookies.user;
        return res.redirect('/');
    }
    if(req.session.user){
        console.log('已登录');
        return res.redirect('/');
    }
    next();
}
exports.noLogin = noLogin;
exports.haveLogin = haveLogin;