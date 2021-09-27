const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const md5 = require('md5');
const session = require('express-session');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ account:[] }).write();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(session({ secret: 'わかるか？あたしの美学', key: 'PEACH', proxy: true, resave: true, saveUninitialized: true}));
const Num = new RegExp(/^(?=.*\d).*$/);
const Big = new RegExp(/^(?=.*[A-Z]).*$/);
const Sml = new RegExp(/^(?=.*[a-z]).*$/);
const Wrd = new RegExp(/^\w*$/);
const Len = new RegExp(/^.{6,30}$/);
const eml = new RegExp(/^\w{1,63}@[a-zA-Z0-9]{2,63}\.[a-zA-Z]{2,63}(\.[a-zA-Z]{2,63})?$/);

app.get('/register',function(req,res) { 
    if (!req.session.user) {
        res.status(200).sendFile(__dirname + "/register.html");
    } else {
        res.redirect("/");
    }
});

app.post('/create-account',function(req,res){
    var wrong = {name:false,password:false,email:false,text:[]};
    if(Wrd.test(req.body.name)==false){
        wrong.name = true;
        wrong.text.push("帳號不得使用特殊符號!!");
    }
    if(Len.test(req.body.name)==false){
        wrong.name = true;
        wrong.text.push("帳號需要6~30個字元!!");
    }
    if(wrong.name==false){
        var all = db.get("account").value();
        for(var i = 0;i<all.length;i++){
            if(req.body.name==all[i].name){
                wrong.name = true;
                wrong.text.push("帳號名稱已使用!!");
            }
        }
    }
    if(Num.test(req.body.password)==false){
        wrong.password = true;
        wrong.text.push("密碼至少要有1個數字!!");
    }
    if(Big.test(req.body.password)==false){
        wrong.password = true;
        wrong.text.push("密碼至少要有1個英文大寫字母!!");
    }
    if(Sml.test(req.body.password)==false){
        wrong.password = true;
        wrong.text.push("密碼至少要有1個英文小寫字母!!");
    }
    if(Wrd.test(req.body.password)==false){
        wrong.password = true;
        wrong.text.push("密碼不得使用特殊符號!!");
    }
    if(Len.test(req.body.password)==false){
        wrong.password = true;
        wrong.text.push("密碼需要6~30個字元!!");
    }
    if(eml.test(req.body.email)==false){
        wrong.email = true;
        wrong.text.push("請輸入正確的電子郵件!!");
    }
    if(wrong.email||wrong.name||wrong.password){
        wrong.text = wrong.text.join("\n");
        res.status(400).send(wrong);
    }else{
        db.get("account").push({name:req.body.name,password:md5(req.body.password),email:req.body.email}).last().write();
        res.status(200).send();
    }
});

app.get('/login',function(req,res){
    if (!req.session.user) {
        res.status(200).sendFile(__dirname + "/login.html");
    } else {
        res.redirect("/");
    }
});

app.post('/check-data',function(req,res) {
    if(Wrd.test(req.body.name)&&Len.test(req.body.name)){
        var user = db.get('account').find({ name: req.body.name }).value();
        if (user) {
            if (user.password == md5(req.body.password)) {
                req.session.user = req.body.name;
                res.status(200).send();
            } else {
                res.status(400).send();
            }
        } else {
            res.status(404).send();
        }
    }else{
        res.sendStatus(404);
    }
});

app.get('/', function (req, res) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        res.status(200).sendFile(__dirname + "/main.html");
    }
});

app.get('/logout', function (req, res) {
    delete req.session.user;
    res.redirect('/login');
});

app.get('/name', function (req,res){
    if (!req.session.user) {
        res.sendStatus(404);
    } else {
        res.status(200).send(req.session.user);
    }
});
app.get('/changepassword', function (req, res) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        res.status(200).sendFile(__dirname + "/changepassword.html");
    }
});
app.post('/cpwd', function(req,res){
    var user = db.get('account').find({ name: req.session.user }).value();
    if (user) {
        if (user.password == md5(req.body.p1)) {
            var wrong = [];
            if(Num.test(req.body.p2)==false){
                wrong.push("密碼至少要有1個數字!!");
            }
            if(Big.test(req.body.p2)==false){
                wrong.push("密碼至少要有1個英文大寫字母!!");
            }
            if(Sml.test(req.body.p2)==false){
                wron.push("密碼至少要有1個英文小寫字母!!");
            }
            if(Wrd.test(req.body.p2)==false){
                wrong.push("密碼不得使用特殊符號!!");
            }
            if(Len.test(req.body.p2)==false){
                wrong.push("密碼需要6~30個字元!!");
            }
            if(wrong[0]){
                wrong = wrong.join("\n");
                res.status(400).send(wrong);
            }else{
                db.get('account').find({ name: req.session.user }).assign({password:md5(req.body.p2)}).value();
                res.sendStatus(200);
            }
        } else {
            res.status(400).send("密碼不符");
        }
    } else {
        res.status(404).send();
    }
});
app.listen(3000,function(){
    console.log("Server start.");
});