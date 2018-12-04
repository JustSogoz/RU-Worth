const express = require("express"),
exphbs = require("express-handlebars"),
moment = require("moment"), 
log = require("./middleware/log.js"),
bodyParser = require('body-parser'),
mysql = require("mysql"),
passport = require("passport"),
LocalStrategy = require("passport-local");

// let connection = mysql.createConnection({
//     host     : 'localhost:5000',
//     user     : 'bob',
//     password : 'secret'
//   });
   
// connection.connect(function(err) {
//     if (err) {
//       console.error('error connecting: ' + err.stack);
//       return;
//     }
   
//     console.log('connected as id ' + connection.threadId);
// });

const app = express();


app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));
app.use(log);
app.engine("handlebars", exphbs({
    partialsDir: __dirname + "/views/partials/" // sets partials folder path
}));
app.set("view engine", "handlebars");
app.get("/", function(req,res){
    res.render("landing");
    //res.send("Hello");
});

app.listen(5000,function(){
    console.log("SERVER IS RUNNING !! THNX TO ME :)");
});
