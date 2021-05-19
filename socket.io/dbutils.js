var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://42.192.40.225:27017/newbegin";
/**
 * 
 * @param {*} URL 
 * @param {*} RoomId 
 * @param {*} context 
 * @param {*} coordinate
 * 
 * sendChattext()  Send the initial statement
 */

exports.insert_chat = function (RoomId,userId,context){
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db("newbegin");
        dbo.collection("test").updateOne({"_id":RoomId},{$push:{"chat":userId+":"+context}},function(err,re){
            if(err) throw err;
                db.close();
        })
        
    })
}


exports.insert_urlandRoom =function (URL,RoomId){
    MongoClient.connect(url,function(err,db){
        if(err) throw err;

        var dbo = db.db("newbegin");

        dbo.collection("test").find({"_id":RoomId}).toArray(function(err1,res){
            if(err1) throw err1;
            //console.log(res);
            if(res.length==0){
                dbo.collection("test").insertOne({"_id":RoomId,"pic":URL,"chat":[],"draw":[]},function(err,re){
                    if(err) throw err;
                    console.log("Insert room and URL");
                    db.close();
                })
            }else{}
        })
    })
}


exports.insert_coordinate = function(data){
    MongoClient.connect(url,function(err,db){
        if(err) throw err;

        var dbo = db.db("newbegin");
        dbo.collection("test").updateOne({"_id":data.RoomId},{$push:{"draw":data}},function(err,re){
            if(err) throw err;
            db.close();
        })
    })

}

exports.update_urlandRoom =function (URL,RoomId){
    MongoClient.connect(url,function(err,db){
        if(err) throw err;

        var dbo = db.db("newbegin");

        dbo.collection("test").find({"_id":RoomId}).toArray(function(err1,res){


            if(err1) throw err1;
            //console.log(res);
            if(res.length==0){
                dbo.collection("test").insertOne({"_id":RoomId,"pic":URL,"chat":[],"draw":[]},function(err,re){
                    if(err) throw err;
                    console.log("Insert room and URL");
                    db.close();
                })
            }else{
                dbo.collection("test").updateOne({"_id":RoomId},{$set:{"pic":URL}},function(err3,r){
                    if(err3) throw err3;
                    console.log("Edit picture");
                })
            }
        })
    })
}

exports.delete_pic = function (RoomId){
    MongoClient.connect(url,function(err1,db){
        var dbo = db.db("newbegin");

        dbo.collection("test").updateOne({"_id":RoomId},{$set:{"draw":[]}},function(err2,re){
            if(err2) throw err2;
            console.log("Data has been deleted");
        })
    })
}