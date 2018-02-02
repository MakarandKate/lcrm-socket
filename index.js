var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var activeUsers={};

io.on('connection', function(socket){
	if(socket.handshake.query.prospectId){
    console.log("New user "+socket.handshake.query.prospectId)
		activeUsers[socket.handshake.query.prospectId]={
			socket:socket,
			timeStamp:new Date().getTime()
		};
	}
  	socket.on('disconnect', function(){
  		delete activeUsers[socket.handshake.query.prospectId];
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