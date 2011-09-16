var express= require('express');
var jqtpl = require('jqtpl');

var sys=require('sys');
//var pub = __dirname + '/styles';
var app = express.createServer(),
sio = require('socket.io');
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
        

        if(error==null) {
          res.render('index.html',{title:"Tatoo List",list:tasks.todo});
        }
        else if(error=="no user") {
          taskProvider.createUser("saturngod",function(error,docs){
            
            taskProvider.findByUser("saturngod",function(error, user_tasks){
              if(error==null) {
                res.render('index.html',{title:"Tatoo List",list:user_tasks.todo});
              }
            });

          });
        }
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

var io = sio.listen(app);

io.sockets.on('connection', function (socket) {
    
    console.log("Socket Connecting");
    socket.on('addnewticket', function (msg) {

      taskProvider.add("saturngod",msg,function(error,result,id){
        socket.emit('addnewticket', msg,id);
        socket.broadcast.emit('addnewticket', msg,id);
      });   
    }); //close addnewticket

    socket.on('delticket',function(id){

      taskProvider.remove("saturngod",id,function(error,result){
        
        socket.emit('delticket',id);
        socket.broadcast.emit('delticket',id);

      });

    });

    socket.on('doneticket',function(id){
      
      taskProvider.closeByid("saturngod",id,function(error,result){
       
        socket.emit('doneticket',id);
        socket.broadcast.emit('doneticket',id);
        
      });

    });
     
});