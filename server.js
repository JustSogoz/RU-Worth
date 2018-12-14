const express = require("express"),
exphbs = require("express-handlebars"),
moment = require("moment"), 
log = require("./middleware/log.js"),
bodyParser = require('body-parser'),
mysql = require("mysql"),
passport = require("passport"),
LocalStrategy = require("passport-local");

const connection = mysql.createConnection({
    host : 'us-cdbr-iron-east-01.cleardb.net', // was "localhost"
    port : 3306,
    user : "be888e53a078fa", // was process.env.DB_USER or root
    password : "1917e697", //process.env.DB_PASSWORD
    database : "heroku_ddfc91115aa930f" // process.env.DB_NAME
});

connection.connect(function(err){
    if (err) return console.log(`Error: ${err.message}`);
    console.log("Connected to MySQL Server");
});

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
});

app.get("/textbooks", function(req, res){
    res.render("textbooks"); // we want to display the textbooks stored here
});

app.get("/textbooks/new", function(req, res){
    res.render("newtextbook");
});

app.post("/textbooks", function(req, res){
    let textbook = {
        ISBN : req.body.ISBN,
        bookname: req.body.bookName,
        author: req.body.author,
        picture_url: req.body.pictureUrl,
        courseid : req.body.course_id
    };

    connection.query("INSERT INTO textbook SET ?", textbook, function(err, result){
        console.log(err);
        console.log(result);
        res.redirect("/textbooks");
    });
});

app.get("/textbooks/:ISBN", function(req,res){ // shows the textbook with the corresponding ISBN
    
    let ISBN = req.params.ISBN;
    
    //Need a query that finds this specific ISBN from the table 
    res.send("Specific Textbook ISBN");
});

app.get("/textbooks/:ISBN/reviews/new", function (req, res){ // need to put middleware for isLoggedIn
    let ISBN = req.params.ISBN;
    
});

app.post("/textbooks/:ISBN/reviews/new", function (req, res){ // need to put middleware for isLoggedIn
    let ISBN = req.params.ISBN;
    /* 
    Run SQL query to find the textbook with the correct ISBN
    then create a new review in that textbook
    */
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", function(req, res){
    let user = {
        username : req.body.username,
        password : req.body.password
    }

});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    let person = {
        email: req.body.email,
        username : req.body.username,
    };
    connection.query("INSERT INTO user SET ?", person, function(err, result){
        console.log(err);
        console.log(result);
        res.redirect("/");
    });
});

app.get("/support", function(req, res){
    res.render("support");
});

/* Catch-all */
app.use(function (request, response) {
    response.status(404).send('Nothing to see here.')
});

app.listen(process.env.PORT || 5000,function(){
    console.log("SERVER IS RUNNING !! THNX TO ME :)");
});
