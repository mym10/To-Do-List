const express = require("express");
const bodyParser = require("body-parser");

let app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let items = [];

app.get("/", function(req, res){
  let today = new Date();
  let options = { weekday: 'long', month: 'long', day: 'numeric' };
  let day = today.toLocaleDateString("en-US", options);
  res.render("list", {DAY: day, NEW: items})
});

app.post("/", function(req, res){
  let item = req.body.newItem;
  items.push(item);
  res.redirect("/");
})


app.listen(process.env.PORT || 3000, function(req, res){
  console.log("server is up and running on port 3000");
})
