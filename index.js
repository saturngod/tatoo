var express= require('express');
var jqtpl = require('jqtpl');

var sys=require('sys');
//var pub = __dirname + '/styles';
var app = express.createServer();
var DataProvider= require('./data-provider').DataProvider;
var taskProvider= new DataProvider('localhost', 27017);
var fs = require("fs");

var app    = express.createServer();

app.configure(function(){
    app.set('view engine', "html");
    app.register('.html', require('jqtpl').express);
    app.set('views', __dirname + "/views");
    app.set('view options', { layout: true });

    app.use(express.compiler({ src:__dirname + '/public', enable: ['less'] }));
    app.use("/public",express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
    app.use(app.router);

});

app.get('/', function(req, res){
    
    taskProvider.findByUser("saturngod",function(error, tasks){
        res.render('index.html',{title:"Tatoo List",list:tasks.todo});
    });
    
});

app.get('/done/:id',function(req,res){
   taskProvider.closeByid("saturngod",req.params.id,function(error,result){
      res.redirect('/');
   });
});

app.get('/del/:id',function(req,res){
   taskProvider.remove("saturngod",req.params.id,function(error,result){
      res.redirect('/');
   });
});

app.post('/add',function(req,res){
   taskProvider.add("saturngod",req.param("task"),function(error,result){
        res.redirect('/');
     });

});


//compile LESS
// 
// app.get("/styles/*.less", function(req, res) {
//     
//     var path = __dirname + req.url;
//     fs.readFile(path, "utf8", function(err, data) {
//     if (err) throw err;
//     less.render(data, function(err, css) {
//             if (err) throw err;
//             res.header("Content-type", "text/css");
//             res.send(css);
//     });
//     });
// });

app.listen(3000);