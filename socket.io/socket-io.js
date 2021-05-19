const n = require('../socket.io/dbutils');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://42.192.40.225:27017/newbegin";


exports.init = function(io) {

  // the chat namespace
  const chat= io
      .of('/chat')
      .on('connection', function (socket) {
    try {
      /**
       * it creates or joins a room
       */
      socket.on('create or join', function (room, userId , picUrl) {
        socket.join(room);
        chat.to(room).emit('joined', room, userId);

        MongoClient.connect(url,function(err1,db){
          if(err1) throw err1;
          var dbo = db.db("newbegin");
          dbo.collection("test").find({"_id":room}).toArray(function(err2,re1){
              if(err2) throw err2;
              if(re1.length!=0){
                var map = new Map(Object.entries(re1[0]));
                var arr1 = Object.values(map.get("chat"));
                var arr2 = Object.values(map.get("draw"));
                var pUrl = map.get("pic").toString();
                setTimeout(() => {
                    chat.to(room).emit('chatInit',room,userId,arr1);
                    chat.to(room).emit('drawingInit',arr2);
                    chat.to(room).emit('getPic',pUrl);
                    //Pass an anothor url
                }, 500);

              }
          })
        })

        setTimeout(() => {
           n.insert_urlandRoom(picUrl,room);
        }, 300);

      });

      socket.on('chat', function (room, userId, chatText) {
        console.log("User"+userId);
        chat.to(room).emit('chat', room, userId, chatText);
        //User name;
        n.insert_chat(room,userId,chatText);
      });

      socket.on('disconnect', function(){
        console.log('someone disconnected');
      });

      socket.on('point', (data,room) =>{
        //console.log("data:"+data);
        chat.to(room).emit('drawing', data);
        n.insert_coordinate(data);
      });

      socket.on('delPos',(roomId)=>{
        chat.to(roomId).emit('update point');
        n.delete_pic(roomId);
      })
    } catch (e) {
    }
  });

  // the news namespace
  const news= io
        .of('/news')
        .on('connection', function (socket) {
      try {
        /**
         * it creates or joins a room
         */
        socket.on('create or join', function (room, userId) {
          socket.join(room);
          socket.broadcast.to(room).emit('joined', room, userId);
        });

        socket.on('news', function (room, userId, chatText) {
          socket.broadcast.to(room).emit('news', room, userId, chatText);
        });

        socket.on('disconnect', function(){
          console.log('someone disconnected');
        });
      } catch (e) {
      }
    });
}
