var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var activeQrs={};

io.on('connection', function(socket){
	console.log("new connection :"+socket.id);
	if(socket.handshake.query.sessionId){
		activeQrs[socket.handshake.query.sessionId]={
			socket:socket,
			timeStamp:new Date().getTime()
		};
	}
  	socket.on('disconnect', function(){
  		delete activeQrs[socket.handshake.query.sessionId];
  	});
  socket.on('session', function(msg){
    //console.log('New session: origin ' + msg.origin + '|'+ msg.sessionId);
    
  });
  	socket.on('scan',function(msg){
  		var payload=JSON.parse(msg);
  		
		console.log("scan :"+msg);
  		activeQrs[payload.url].socket.emit('userDetails',payload);
  		
  	});
});
setInterval(function(){
	var count=0;
	for(key in activeQrs){
		++count;
	}
	console.log("active peers : "+count);

},10000);

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:'+(process.env.PORT || 3000));
});