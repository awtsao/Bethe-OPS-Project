This is a project for CS 5150 done in the Spring 2019 semester. The repository has been cloned from the original Cornell repository for public view. As the copyright of Bethe OPS belongs to Erica Ostermann, please reach out to eo93@cornell.edu for inquiries about usage of the code. 
# Bethe OPS

Bethe OPS is an online, automated house event sign-up tool for Cornell's Hans Bethe House. Bethe OPS can be accessed here (**NOTE**: the EC2 instance for the app must be running): http://events.hansbethehouse.cornell.edu/.

## Getting Started

### Requirements

* Node.js
    * Express
    * Passport
* EJS
* Materialize CSS
* jQuery
* MySQL 8.0
* AWS
    * EC2
    * RDS
* PM2
* Shibboleth
* SAML
* Git

### Installation
**Installing the App**

To install the project, clone the repo and run the following command:
```
npm install
```

**Installing MySQL**

To connect to the database in a local environment, install [MySQL 8.0](https://dev.mysql.com/downloads/). Installing a database design tool is recommended. Two options are [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) and [Sequel Pro](https://sequelpro.com/download) (Mac only). If you wish to use MySQL Workbench, simply download `MySQL Workbench` when downloading MySQL from the linked attached.

## Running the App
### Running the App Locally

Before running the app, you must first connect to the database on your end. 

**MySQL Workbench**

If you are using MySQL Workbench, do the following:
1. Open MySQL Workbench.
2. For Windows, search "Services" in Windows. Scroll until you find `MySQL` (or something of similar naming with "MySQL" in the name, depending on how you configure MySQL) and select `MySQL`. To the left, click "Start" to start MySQL; you can also right-click and select "Start". Go back to MySQL Workbench. For MacOS, open "System Preferences" and click on the "MySQL" panel. Click "Start MySQL Server" to start MySQL.
3. Create a new MySQL connection. If you already have a MySQL connection, skip to step 4.
    * Click the [+] icon next to "MySQL Connections".
    * Enter a string to name your connection in the "Connection Name" field.
    * Enter `localhost` in the "Hostname" field.
    * Make sure the "Port" field says `3306` and the "Username" field says `root`.
    * Click "Test Connection" to confirm the connection is valid given the parameter values. A pop-up stating the connection was successful should show up.
    * Click "OK" to save the connection.
4. Click on your MySQL connection instance. MySQL Workbench will prompt you for your password.
    * Upon authentication, to check that you are connected, click the "Administration Tab" towards the bottom of the left sidebar. 
    * Click "Server Status".
    * If you see "Running" to the right, then you are connected; otherwise, you may need to restart MySQL to establish a connection.
        * **NOTE**: If you were not prompted for you password, then you are most likely not connected).
5. Go to "File" and select "Open SQL Script". Navigate to the project folder and select "database.sql".
6. In the left sidebar labeled "SCHEMAS", click the refresh icon to the right of "SCHEMAS". The database, `mydb`, should now appear.

**Sequel Pro**

If you are using Sequel Pro with *MacOS*, do the following:
1. If you previously set a password, login to MySQL on your terminal with "mysql -u root -p" and return. Then, you will be prompted to enter a password. If you did not previously set a password, login to MySQL on your terminal with "mysql -u root" and return. 
2. Once logged in, copy + paste the code in `database.sql` and dump into the MySQL terminal. This will create the database `mydb`.
3. Open up Sequel Pro.
4. Switch to the TCP/IP tab and put `127.0.0.1` for "Host", `root` for "Username", the password you set up for MySQL (or nothing if you did not) for "Password", and `3306` for "Port". 
5. Click "Connect".
6. In the "Choose Database" dropdown, click "mydb". You should now see all of `mydb`'s tables on the left.

Upon successful connection to the database, to run the app, do the following:
1. Go into `./exports/db.js`, insert your password for the database connection, and uncomment the following code only:
```
var mysql = require('mysql');
var util = require('util');

var con;
function connectDatabase() {
    if (!con) {
        con = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '********',
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
```
2. Go into the folder `./routes` and for each of `students.js`, `eventleader.js`, and `admin.js`, for the root route, change `req.user.personID` to the person ID (a number) of a valid user of that user type. Below is the root route of `admin.js`:
```
router.get('/', function(req, res) {
    makeHome.getAdminELHome(req, res, con, async, 'admin', req.user.personID);
});
```
3. Run the following command:
```
npm start
```
4. Open your browser and go to `localhost:3000/<user_type>` where `<user_type>` is replaced by either "students", "eventleader", or "admin", depending on which user event landing page you would like to go to.
    * NOTE: Login cannot be tested locally since it requires the use of cookies.

### Connecting to the Amazon EC2 Instance

**Connecting with PuTTY**

To connect to the Amazon EC2 instance with PuTTY, do the following:
1. Go into `./exports/db.js`, insert your password for the database connection, and uncomment the following code only:
```
var mysql = require('mysql');
var util = require('util');

var db = mysql.createPool({
   host: 'betheops-db-instance.cymmf1dfezhv.us-east-2.rds.amazonaws.com',
   user: 'StudentTech',
   password: '********',
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
```
2. Download [PuTTY and PuTTYgen](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html).
3. Open PuTTY.
4. Enter `ec2-13-59-141-230.us-east-2.compute.amazonaws.com` in the "Host Name" field.
5. In the left sidebar, go to "Connection" > "Data". 
6. Enter `ubuntu` in the "Auto-login username" field.
7. Under "Connection", go to "SSH" > "Auth".
8. Click "Browse" next to the "Private key file for authentication". Navigate to the project folder and select `BetheOPSConverted.ppk`.
9. Go back to "Session" in the left sidebar.
10. Enter a string to name your session in the "Saved Sessions" field. Click "Save" to save the session.
11. Click "Open".
12. Navigate to `Bethe-OPS-Project` by typing `cd Bethe/Bethe-OPS-Project`.
13. The system uses [PM2](https://www.npmjs.com/package/pm2) to keep the application alive. Check if `app` is `online` by running the following command:
```
pm2 list
```
14. If `app` isn't running (i.e., `stopped`), run the following command to connect to the instance (you can also just do `app` instead of `app.js`):
```
pm2 start app.js
```
15. If you exit PuTTY, to re-open your session, simply double-click the name you gave to the session from step 10.

**Connecting with SSH on MacOS**

To connect to the Amazon EC2 instance with SSH on MacOS, do the following:
1. Same as step 1 for **Connecting with PuTTY**.
2. Open your terminal.
3. Navigate to the project folder.
4. To make sure the key is not publicly viewable, run the following command:
```
chmod 400 BetheOPS.pem
```
5. Run the following command to connect to the instance:
```
ssh -i "BetheOPS.pem" ubuntu@ec2-13-59-141-230.us-east-2.compute.amazonaws.com
```
6. If there are updates, run the command provided in the terminal.
7. Follow steps 12-14 from **Connecting with PuTTY**.

For both PuTTY and SSH on MacOS, to pull changes pushed to the Github repository, `Bethe-OPS-Project`, do the following:
1. Navigate to `Bethe/Bethe-OPS-Project` upon connecting if you are not connected to the EC2 instance.
2. Run the following command to stop the app if it is currently running (run `pm2 list` to check):
```
pm2 stop app
```
3. Run the following command to pull changes:
```
git pull
```
4. Run the following command to restart the app:
```
pm2 start app
``` 

## Other Documentation

Other documentation concerning the design and implementation of Bethe OPS is under `./documentation`.

## Contributing

Only those added as collaborators may contribute to the development of Bethe OPS.

## Authors

Jaewon Sim, Albert Tsao, Yun Ping Tseng, Yuxin Xu, Angela Zhang, Amy Zhong, Jennifer Zhou

## License

The copyright and unrestricted license of Bethe OPS belongs to Erica Ostermann.
