var cors = require('cors');
var app = require('express')();
app.use(cors());
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
        data:socket.handshake.query,
        socket:socket,
        timeStamp:new Date().getTime()
      };
      //console.log("informing all admins");
      for(key in activeAdmins){
        if(activeAdmins[key].product.indexOf(activeUsers[socket.handshake.query.prospectId].product)!=-1){
          activeAdmins[key].socket.emit('newUser',{"data":socket.handshake.query});
        }
      }  
    }else if(socket.handshake.query.userType=="admin"){
      //console.log("new admin");
      activeAdmins[socket.handshake.query.adminId]={
        socket:socket,
        product:socket.handshake.query.product,
        timeStamp:new Date().getTime()
      };
      var userList=[];
      for(key in activeUsers){
        if(activeAdmins[socket.handshake.query.adminId].product.indexOf(activeUsers[key].product)!=-1){
          userList.push({"data":activeUsers[key].data});
        }
      }
      activeAdmins[socket.handshake.query.adminId].socket.emit('userList',userList);
    }
    
	}
  	socket.on('disconnect', function(){
      if(socket.handshake.query.userType=="prospect"){
        setTimeout(function(){
          io.emit('userLeft',socket.handshake.query.prospectId);
          delete activeUsers[socket.handshake.query.prospectId];
        },(30*60*1000));
      }else if(socket.handshake.query.userType=="admin"){
        delete activeAdmins[socket.handshake.query.adminId];
      }
  	});

    socket.on('prospectClaim',function(obj){
      io.emit('leadClaimed',obj);
    });

    socket.on('paymentInit',function(obj){
      console.log("paymentInit by :"+obj.prospectId);
      io.emit('leadPayment',obj);
    })
 
});

setInterval(function(){
	var count=0;
	for(key in activeUsers){
		++count;
	}
	console.log("active peers : "+count);

},10000);


http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:'+(process.env.PORT || 3000));
});