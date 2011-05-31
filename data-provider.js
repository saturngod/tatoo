var Db = require('mongodb').Db,
ObjectID = require('mongodb').BSONNative;
Server = require('mongodb').Server,
Connection = require('mongodb').Connection;

var sys= require('sys');
DataProvider = function(host,port){
  this.db = new Db('tatoo', new Server(host, port, {}), {native_parser:true});
  this.db.open(function(){});  
};

DataProvider.prototype.getCollection = function(callback){
  this.db.collection('tasks',function(error,task_collection){
     if(error)  callback(error);
     else callback(null,task_collection);
  });
};

DataProvider.prototype.findAll=function(callback){
    this.getCollection(function(error,task_collection){
        if(error)   callback(error);
        else {
            task_collection.find({},function(error,cursor){
                
                if(error) callback(error);
                else {
                    cursor.toArray(function(error,results){
                    if(error)     callback(error);
                    else callback(null,results);
                    });
                }
            });
        }
    });
};

DataProvider.prototype.findByUser=function(user,callback){
    this.getCollection(function(error,task_collection){
        if(error)   callback(error);
        else {
            task_collection.findOne({user:user},function(error,result){
                if( error ) callback(error)
                else callback(null, result)
            });
        }
    });
};

DataProvider.prototype.closeByid=function(username,taskId,callback) {
    this.getCollection(function(error,task_collection){
        if(error) callback(error);
        else {
            
           task_collection.update({user:username,'todo.id':Math.floor(taskId)}, {"$set":{"todo.$.done":1}},{safe:true},function(error, result){
                                      if( error ) callback(error,result);
                                      else callback(null,result)
                                         
                                 });
           
        }
    });
}

DataProvider.prototype.remove=function(username,taskId,callback){
   this.getCollection(function(error,task_collection){
       task_collection.update({user:username,'todo.id':Math.floor(taskId)},{"$unset":{"todo.$":1}},{safe:true},function(error,result){
           if( error ) callback(error,result);
           else {
               //clear remove object
                task_collection.update({user:username},{"$pull":{todo:null}},{safe:true},function(error,result){
                    if( error ) callback(error)
                    else callback(null, result);  
                });
           }
       });
   }); 
}

exports.DataProvider= DataProvider;