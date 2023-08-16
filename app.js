const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

let app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true}); //connecting and creating a database 

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema); //creating a new collection

const item1 = new Item({
  name: "Welcome to your to-dolist"
});
const item2 = new Item({
  name: "Enter your item and hit '+'"
});
const item3 = new Item({
  name: "<-- check the box to delete the item"
});

const defaultItems=[item1, item2, item3];

const ListSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", ListSchema)


app.get("/", function(req, res){

  Item.find({}) //finds everything in the collection
    .then(function(foundItems) {
      if(foundItems.length===0) {
          Item.insertMany(defaultItems)
          .then(function() {
            console.log("saved items to the database");
          })
          .catch(function(err) {
            console.log(err);
          });
          res.redirect("/");
      } else {
          // let today = new Date();
          // let options = { weekday: 'long', month: 'long', day: 'numeric' };
          // let day = today.toLocaleDateString("en-US", options);
          res.render("list", {ListTitle: "Today", NEW: foundItems})
      }
    })
    .catch(function(err) {
      console.log(err);
    });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
  .then(function(foundList) {
    if(!foundList) {
      //creating a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      //show existing list
      res.render("list", {ListTitle: foundList.name, NEW: foundList.items})
    }
  })
  .catch(function(err) {
      console.log(err);
  });
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.List;

  const item = new Item({
    name: itemName
  });
  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch(function(err) {
        console.log(err);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today") {
    Item.findByIdAndRemove(checkedItem)
    .then(function() {
      console.log("deleted checked item");
      res.redirect("/");
    })
    .catch(function(err) {
        console.log(err);
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}})
    .then(function(foundList) {
      res.redirect("/" + listName);
    })
    .catch(function(err) {
        console.log(err);
    });
    
  }

  
});

app.listen(process.env.PORT || 3000, function(req, res){
  console.log("server is up and running on port 3000");
});
