var express= require('express');
var jqtpl = require('jqtpl');

var sys=require('sys');

var app = express.createServer();

var DataProvider= require('./data-provider').DataProvider;

var taskProvider= new DataProvider('localhost', 27017);

app.set("view engine", "html");
app.register(".html", require("jqtpl").express);
app.set('views', __dirname + '/views');
app.set("view options", { layout: true });

app.configure(function(){
    app.use("/styles", express.static(__dirname + '/styles'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.bodyParser());
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

app.listen(3000);