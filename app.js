var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.disable('etag');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(serveStatic('bower_components'));
app.use(cookieParser('fy_'));

// =================================================================================
//app api 接口服务

//自动注册所有ｓｅｒｖｉｃｅ为ｒｐｃ服务
var rpc = require('./lib/rpc');
var dirWalk = require('./lib/myfs/digui');
var _s = require('underscore.string');
var serviceFileFolder = __dirname + '/service';
var serviceFileList = dirWalk.syncWalk(serviceFileFolder, 0);
console.info('需引入RPC注册的服务地址是： ');
var rpcScripts = serviceFileList.map(function (o) {
    var service = require('.' + o.rpcPath);
    var ret = o.rpcPath.split('/');
    var clientName = _s.capitalize(ret[ret.length - 2]) + _s.capitalize(ret[ret.length - 1].replace('.js', ''));
    app.use(o.rpcPath, rpc(express, '/helper.js', clientName, service));
    var script = ['script(src=\'', o.rpcPath, '/helper.js', '\')\n',
        "script var ", clientName, " = new ", clientName, "('", o.rpcPath, "');\n"].join('');
    console.log(script);
    return script;
});
var fs = require('fs');
var rpcJadePath = __dirname + '/views/include/rpc.jade';
try{fs.unlinkSync(rpcJadePath);}catch(e){}
fs.writeFile(rpcJadePath, rpcScripts.join('\n'), function (err, x) {
});

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    //next(err);
    res.render('404', {
        message: err.message,
        error: err
    });
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        console.log(err);
        res.render('500', {
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    console.log(JSON.stringify(err));
    res.render('500', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
