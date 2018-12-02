const express = require("express"),
exphbs = require("express-handlebars"),
moment = require("moment"), 
log = require("./middleware/log.js");

const app = express();

app.use(express.static('public'));
app.use(log);
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.get("/", function(req,res){
    res.render("landing");
    //res.send("Hello");
});

app.listen(5000,function(){
    console.log("SERVER IS RUNNING !! THNX TO ME :)");
});
