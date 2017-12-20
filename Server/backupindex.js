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

http.listen(4000,function(){
    console.log("Listening on 4000");
});

// Handle socket operation.
// On any connection listen for events.

io.on('connection',function(socket){
    console.log('We have user connected !');
	
		socket.on('addroom',function(data){
                rooms.push(data.roomname);
				socket.room = data.roomname;
				usernames[username] = data.username;
				socket.join(data.roomname);
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected to ' + data.roomname);
		// echo to room that a person has connected to their room
		socket.broadcast.to(data.roomname).emit('updatechat', 'SERVER', data.username + ' has connected to this room');
		socket.emit('updaterooms', rooms, data.roomname);
    });
	
        // This event will be emitted from Client when some one add comments.
    socket.on('comment added',function(data){
                // Add the comment in database.
        db.addComment(data.user,data.comment,mysql,pool,function(error,result){
            if (error) {
                io.emit('error');
            } else {
                // On successful addition, emit event for client.
                io.sockets.in(socket.room).emit("notify everyone",{user : data.user,comment : data.comment});
            }
        });
    });
	
	
	/***********Switch rooms*****************/
	
	socket.on('switchRoom', function(newroom){
		// leave the current room (stored in session)
		socket.leave(socket.room);
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username +' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	
	/***********Switch rooms end*****************/
	
	
	
	
	
	  //Notify event update
	socket.on('event updated',function(data){

                // On successful addition, emit event for client.
                socket.broadcast.emit("notify event updated",{user : data.user, eventupdated :data.eu, updateinfo :data.ui});
        
    });
	
	socket.on('addcollab',function(data){
                // On successful addition, emit event for client.
                socket.broadcast.emit("collabadded",{user : data.user, addedto:data.ev, addedby : data.owner});
				
    });
	
	
	/***********Disconnect*****************/
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
	
	/***********Disconnect end*****************/
});
