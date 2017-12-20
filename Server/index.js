//index.js file

var express = require('express');
var app     = express();
var path    = require("path");
var mysql   = require("mysql");
var http    = require('http').Server(app);
var io      = require('socket.io')(http);
var router  = express.Router();

/* Creating POOL MySQL connection.*/

var pool    =    mysql.createPool({
      host              :   'tsmsweb.clkgrrfzqfem.us-west-2.rds.amazonaws.com',
      user              :   'teamone',
      password          :   'tsmsweb12',
      database          :   'tsmsdb',
      port              :   3306,
      debug             :   false
});

var usernames = {};

// rooms which are currently available in chat
var rooms = {};

// Require Database operation and router files.

var db      = require("./db");
var routes  = require("../Routes/")(router,mysql,pool);

app.use('/',router);

http.listen(4001,function(){
    console.log("Listening on 4001");
});
var usernames = {};

// rooms which are currently available in chat
var rooms = [];
// Handle socket operation.
// On any connection listen for events.
  
      db.getUsers(mysql,pool,function(error,result){
            if (error) {
                io.emit('error');
            } else {
              for(var i in result){
				  var str = String(result[i].username);
				  var arr = str.split(":").map(function (val) {
					return val;
					});
					 usernames[i] = arr;
			  }
               
            }
        });
		    db.getEvents(mysql,pool,function(error,result){
            if (error) {
                io.emit('error');
            } else {
				var count = 0;
              for(var i in result){
				  var str = String(result[i].ID);
				  var arr = str.split(":").map(function (val) {
					return val;
					});
					 rooms[count] = arr + "all"; count += 1;
					 rooms[count] = arr + "org"; count += 1;
					 rooms[count] = arr + "judge"; count += 1;
					 rooms[count] = arr + "notifications"; count += 1;
					 
					  
			  }
               console.log(rooms);
            }
        });
   
io.sockets.on('connection', function (socket) {
	console.log('We have user connected !');

	
		
		
	 socket.on('subscribe', function(data) { 
       console.log('joining room', data.room);
        socket.join(data.room); 
    })

    socket.on('unsubscribe', function(data) {  
        console.log('leaving room', data.room);
        socket.leave(data.room); 
		
		socket.broadcast.to(socket.room).emit('updatechat',{ user : "SERVER", message : data.message });
    })

    
	socket.on("colab added", function(data){
	
	})
	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) { 
		// we tell the client to execute 'updatechat' with 2 parameters
		console.log(data.username);
		console.log(data.message);
		console.log(data.room);
		socket.room = data.room;
		console.log(socket.room);
		db.addComment(data.username,data.message,data.room,mysql,pool,function(error,result){
            if (error) {
                io.emit('error');
            } else {
                // On successful addition, emit event for client.
              socket.broadcast.to(socket.room).emit('updatechat',{ user : data.username, message : data.message, room : socket.room });
            }
		});
	});

	socket.on('change', function (data) { 
		// we tell the client to execute 'updatechat' with 2 parameters
		console.log(data.evet);
		console.log(data.round);
		
		socket.room = data.room;
		console.log(socket.room);
		
                // On successful addition, emit event for client.
              socket.broadcast.to(socket.room).emit('roundchange',{ evet : data.evet, message : data.message, room : socket.room });
            
		});
	

	socket.on('notify', function (data) { 
		// we tell the client to execute 'updatechat' with 2 parameters
		console.log(data.username);
		console.log(data.notification);
		console.log(data.room);
		socket.room = data.room;
		console.log(socket.room);
		
                // On successful addition, emit event for client.
              socket.broadcast.to(socket.room).emit('notify',{ user : data.username, notification : data.notification });
          
		});
	});
