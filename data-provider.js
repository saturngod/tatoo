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

            task_collection.count(function(err, count) {
              if(count > 0) {
                task_collection.findOne({user:user},function(error,result){
                  if( error ) callback(error)
                  else {
                    callback(null, result);
                  }
                });
              }
              else {
                callback("no user",null);
              }
            });

            
        }
    });
};

DataProvider.prototype.createUser=function(username,callback){
  this.getCollection(function(error,task_collection){
    if(error) callback(error);
    else {
      task_collection.insert({"user" : username, "todo" : []},function(err,docs){
        callback(err,docs);
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
       //set null
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

DataProvider.prototype.add=function(username,taskname,callback) {
    this.getCollection(function(error,task_collection){
        //try to get latest id
        task_collection.findOne({user:username},function(error,result){
            if( error ) callback(error,result);
            else {
                //increase id, add id by latest id
                task_collection.update({user:username},{"$push":{todo:{id:Math.floor(result.lastid)+1,desc:taskname,done:0}},"$inc":{lastid:1}},{safe:true},function(error,result_update){
                    if( error ) callback(error)
                    else callback(null, result_update,Math.floor(result.lastid)+1);
                });
            }
        });
    });
}

exports.DataProvider= DataProvider;