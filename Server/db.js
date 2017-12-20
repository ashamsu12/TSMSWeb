var addComment = function(user,comment,room,mysql,pool,callback) {
    var self = this;
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            return callback(true,null);
        } else {
            var sqlQuery = "INSERT into ?? (??,??,??) VALUES (?,?,?)";
            var inserts =["chatdetails","room","username",
                                     "message",
                                      room,user,comment];
            sqlQuery = mysql.format(sqlQuery,inserts);
            connection.query(sqlQuery,function(err,rows){
                connection.release();
                if (err) {
                    return callback(true,null);
                } else {
                    callback(false,"comment added");
                }
            });
        }
        connection.on('error', function(err) {
            return callback(true,null);
        });
    });
};

var getUsers = function(mysql,pool,callback) {
    var self = this;
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            return callback(true,null);
        } else {
    var queryString = 'SELECT username FROM users';
 
		connection.query(queryString, function(err, rows, fields) {
		if (err) throw err;
 
     callback(false,rows)
});
        }
        connection.on('error', function(err) {
            return callback(true,null);
        });
    });
};

var getEvents = function(mysql,pool,callback) {
    var self = this;
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            return callback(true,null);
        } else {
    var queryString = 'SELECT ID,Name  FROM events';
 
		connection.query(queryString, function(err, rows, fields) {
		if (err) throw err;
 
     callback(false,rows)
});
        }
        connection.on('error', function(err) {
            return callback(true,null);
        });
    });
};

module.exports.getEvents = getEvents;
module.exports.getUsers = getUsers;
module.exports.addComment = addComment;
