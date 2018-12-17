const express = require("express"),
    exphbs = require("express-handlebars"),
    log = require("./middleware/log.js"),
    bodyParser = require('body-parser'),
    mysql = require("mysql"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    session = require("express-session"),
    expressValidator = require("express-validator"),
    bcrypt = require("bcrypt"),
    MySQLStore = require("express-mysql-session"),
    favicon = require("serve-favicon"),
    path = require("path");

const saltRounds = 10; 
const pool = mysql.createPool({ //pool instead of connection because connection disconnects every 30 seconds
    connectionLimit: 10,
    host : "us-cdbr-iron-east-01.cleardb.net", // process.env.DB_HOST
    port : 3306,
    user : "be888e53a078fa", // process.env.DB_USER
    password :"1917e697", //  process.env.DB_PASSWORD
    database : "heroku_ddfc91115aa930f"//  process.env.DB_DATABASE
});

let options = { //pool instead of connection because connection disconnects every 30 seconds
    host : "us-cdbr-iron-east-01.cleardb.net", // process.env.DB_HOST
    port : 3306,
    user : "be888e53a078fa", // process.env.DB_USER
    password :"1917e697", //  process.env.DB_PASSWORD
    database : "heroku_ddfc91115aa930f"//  process.env.DB_DATABASE
};

let sessionStore = new MySQLStore(options);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
// Logging
app.use(log);
app.use(favicon(__dirname+'/public'+'/favicon.ico'));
//Authentication 
app.use(expressValidator()); 

app.use(session({ 
    secret: '1337 |-|/-\}{0|2',
    resave: false, 
    saveUninitialized: false,
    store: sessionStore
    //cookie : {secure: true}
}));

app.use(passport.initialize());
app.use(passport.session())

app.use(function(req, res, next){ // for dynamic login, register and logout functionality
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
})

app.use(express.static('public'));

app.engine("handlebars", exphbs({
    partialsDir: __dirname + "/views/partials/" // sets partials folder path
}));

app.set("view engine", "handlebars");

app.get("/", function(req,res){
    console.log((!req.user) ? "No Users Logged In" : `${req.user} is Logged In`);
    console.log(`Authentication Status: ${req.isAuthenticated()}`);
    res.render("landing", {username: req.user});
});

app.post("/search", function(req, res){ // search route
    
  
    let ISBN = req.body.ISBN;
   
    res.redirect(`textbooks/${ISBN}`);
});

app.get("/textbooks", function(req, res){
    let sqlQuery = `SELECT * FROM textbook`
    pool.query(sqlQuery, function(err, result){
        if(err) console.log("SQL Error");
        console.log(result);

        var arrayOfArrays = [];
        for (let i=0; i<result.length; i+=3) { // puts the textbooks in mini arrays of length 4
            arrayOfArrays.push(result.slice(i,i+3));
        }

        res.render("textbooks", {queryResult : arrayOfArrays}); // we want to display the textbooks stored here
    });
    
});

app.get("/textbooks/new", authenticationMiddleware(), function(req, res){
    res.render("newtextbook");
});

app.post("/textbooks", authenticationMiddleware(),  function(req, res){
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
    let sqlQuery = `SELECT *, AVG(effectrating) AS Rating, AVG(recommend) AS recommend FROM textbook INNER JOIN reviews ON textbook.ISBN = reviews.ISBN
     WHERE textbook.ISBN = ${req.params.ISBN}`;
    pool.query(sqlQuery, function(err, result){

        console.log(result)
        if(result.length > 0 && result[0].ISBN){
            res.render("textbook", {textbook : result});
        } else{
            console.log(req.params.ISBN);
            let noReviewQuery = `SELECT *, ISBN FROM textbook WHERE ISBN = ${req.params.ISBN}`;
            pool.query(noReviewQuery, function(err, result2){
                res.render("textbookempty", {textbook : result2});
            });
        }
    });
});

app.get("/textbooks/:ISBN/reviews/new", authenticationMiddleware(), function (req, res){ // need to put middleware for isLoggedIn
    let ISBN = req.params.ISBN;
    res.render("newreview", {ISBN: ISBN});
});

app.post("/textbooks/:ISBN/reviews/new", authenticationMiddleware(), function (req, res){ // need to put middleware for isLoggedIn
    let ISBN = req.params.ISBN;
    let review = {
        ISBN : ISBN,
        username : req.user,
        courseid : req.body.courseid,
        effectrating : req.body.effectrating,
        recommend : req.body.recommend,
        description : req.body.description
    };
    pool.query("INSERT INTO reviews SET ?", review, function(err, result){
        console.log(err);
        console.log(result);
        res.redirect("/textbooks");
    });
});

app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", {successRedirect: "/", failureRedirect: "/login"}));

app.get("/logout", function(req, res){
    req.logout(); //logouts in passport
    req.session.destroy(); //removes the cookie
    res.redirect("/");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, function(err, hash){
        pool.query("INSERT INTO `user` (`username`,`email`,`password`) VALUES (?, ?, ?)", [username, email, hash] ,function(err, result){
            if (err) console.log(err);
            console.log(result);
            req.login(username, function(err){
                if(err) console.log(err);
                res.redirect("/")
            });

        });
    });
});

app.get("/support", function(req, res){
    res.render("support");
});

//Authentication
passport.serializeUser(function(username, done){

    done(null, username);

});

passport.deserializeUser(function(username, done){
    done(null, username);
});

function authenticationMiddleware() {
    return (req, res, next) => {
        console.log(`req.session.passport.user: 
        ${JSON.stringify(req.session.passport)}`
        );
        if(req.isAuthenticated()) return next();
        res.redirect("/login");
    }
}
passport.use(new LocalStrategy(
  function(username, password, done) {
      console.log(username);
      console.log(password);

      pool.query("SELECT password FROM user WHERE username = ?", [username], function(err, results){
        if(err) {done(err)};
        if(results.length === 0) done(null, false);
        else{
            console.log(results[0].password.toString());
            const hashedPassword = results[0].password.toString();
            bcrypt.compare(password, hashedPassword, function(err, res){  // checks if the hashed password is equal to the inputted password
                if(res){
                    return done(null, username);
                }
                return done(null, false);
            });
        }
      });
    })
);
//End of Authentication functions/passport, need to refactor code

/* Catch-all */
app.use(function (req, res) {
    res.status(404).send('Nothing to see here.');
});

app.listen(process.env.PORT || 5000,function(){
    console.log("SERVER IS RUNNING !! THNX TO ME :)");
});
