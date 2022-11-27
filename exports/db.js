var mysql = require('mysql');
var util = require('util');

/***** TO RUN APP LOCALLY START *****/
/*
var con;
function connectDatabase() {
   if (!con) {
      // insert password for MySQL for 'password'
      con = mysql.createPool({
         host: 'localhost',
         user: 'root',
         password: '',
         database: 'mydb'
      });

      con.getConnection(function(err, connection) {
            if (err) {
               throw err;
            } else {
               console.log('Connected!');
            }
      });
      con.query = util.promisify(con.query).bind(con);
   }

   return con;
}

module.exports = connectDatabase();
*/
/***** TO RUN APP LOCALLY END *****/

/***** TO RUN APP VIA EC2 START *****/
var db = mysql.createPool({
    host: 'betheops-db-instance.cymmf1dfezhv.us-east-2.rds.amazonaws.com',
    user: 'StudentTech',   
    password: 'BetheOPS',
    database: 'mydb'
});

db.getConnection(function(err, connection) {
   if (err) {
      throw err;
   } else {
      console.log('Connected!');
   }
});

db.query = util.promisify(db.query).bind(db);
module.exports = db;
/***** TO RUN APP VIA EC2 END *****/
