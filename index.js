var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var activeUsers={};
var activeAdmins={};

io.on('connection', function(socket){
	if(socket.handshake.query){
    if(socket.handshake.query.userType=="prospect"){
      activeUsers[socket.handshake.query.prospectId]={
        product:socket.handshake.query.product,
        socket:socket,
        timeStamp:new Date().getTime()
      };
      for(key in activeAdmins){
        if(activeAdmins[key].product.indexOf(getActiveUsers[socket.handshake.query.prospectId].product)!=-1){
          activeAdmins[key].socket.emit('newUser',{"prospectId":socket.handshake.query.prospectId,"product":socket.handshake.query.product});
        }
      }  
    }else if(socket.handshake.query.userType=="admin"){
      activeAdmins[socket.handshake.query.adminId]={
        socket:socket,
        product:socket.handshake.query.product,
        timeStamp:new Date().getTime()
      };
      var userList=[];
      for(key in activeUsers){
        if(activeAdmins[socket.handshake.query.adminId].product.indexOf(getActiveUsers[key].product)!=-1){
          userList.push({"prospectId":key,"product":getActiveUsers[key].product});
        }
      }
      activeAdmins[socket.handshake.query.adminId].socket.emit('userList',userList);
    }
    
	}
  	socket.on('disconnect', function(){
      if(socket.handshake.query.userType=="prospect"){
        setTimeout(function(){
          for(key in activeAdmins){
            activeAdmins[key].socket.emit('userLeft',socket.handshake.query.prospectId)
          }
          delete activeUsers[socket.handshake.query.prospectId];
        },(5*60*1000));
      }else if(socket.handshake.query.userType=="admin"){
        delete activeAdmins[socket.handshake.query.adminId];
      }
  	});

    socket.on('getActiveUsers',function(msg){
      console.log("getActiveUsers");
      console.log(msg);
      //activeAdmins[].socket.emit('userDetails',payload);
    });
 
});
/*
setInterval(function(){
	var count=0;
	for(key in activeUsers){
		++count;
	}
	console.log("active peers : "+count);

},10000);
*/

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:'+(process.env.PORT || 3000));
});