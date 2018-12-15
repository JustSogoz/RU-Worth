const express = require("express"),
exphbs = require("express-handlebars"),
moment = require("moment"), 
log = require("./middleware/log.js"),
bodyParser = require('body-parser'),
mysql = require("mysql"),
passport = require("passport"),
LocalStrategy = require("passport-local");

const pool = mysql.createPool({
    connectionLimit: 10,
    host : "us-cdbr-iron-east-01.cleardb.net", // process.env.DB_HOST
    port : 3306,
    user : "be888e53a078fa", // process.env.DB_USER
    password :"1917e697", //  process.env.DB_PASSWORD
    database : "heroku_ddfc91115aa930f"//  process.env.DB_DATABASE
});

// connection.connect(function(err){
//     if (err) return console.log(`Error: ${err.message}`);
//     console.log("Connected to MySQL Server");
// });

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
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
    let sqlQuery = `SELECT * FROM textbook`
    pool.query(sqlQuery, function(err, result){
        if(err) console.log("SQL Error");
        console.log(result);

        var arrayOfArrays = [];
        for (let i=0; i<result.length; i+=3) {
            arrayOfArrays.push(result.slice(i,i+3));
        }

        res.render("textbooks", {queryResult : arrayOfArrays}); // we want to display the textbooks stored here
    });
    
});

app.get("/textbooks/new", function(req, res){
    res.render("newtextbook");
});

app.post("/textbooks", function(req, res){
    let textbook = {
        ISBN : req.body.ISBN,
        title: req.body.title,
        author: req.body.author,
        pictureurl: req.body.pictureUrl
    };

    pool.query("INSERT INTO textbook SET ?", textbook, function(err, result){
        console.log(err);
        console.log(result);
        res.redirect("/textbooks");
    });
});

app.get("/textbooks/:ISBN", function(req,res){ // shows the textbook with the corresponding ISBN
    let sqlQuery = `SELECT * FROM textbook WHERE ISBN = ${req.params.ISBN}`
    pool.query(sqlQuery, function(err, result){
        console.log(result)
        res.render("textbook", {textbook : result});
    });
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
        username : req.body.username
    };
    pool.query("INSERT INTO user SET ?", person, function(err, result){
        console.log(err);
        console.log(result);
        res.redirect("/");
    });
});

app.get("/support", function(req, res){
    res.render("support");
});

/* Catch-all */
app.use(function (req, res) {
    response.status(404).send('Nothing to see here.')
});

app.listen(process.env.PORT || 5000,function(){
    console.log("SERVER IS RUNNING !! THNX TO ME :)");
});
