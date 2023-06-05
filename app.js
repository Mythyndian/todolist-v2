//jshint esversion:6
const mongoose = require('mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model('Item', itemSchema);

const task1 = new Item({
  name: "Welcome to your todolist!"
});

const task2 = new Item({
  name: "Hit the + button to add a new item."
});

const task3 = new Item({
  name: "<-- Hit this button to delete."
});

const defaultItems = [task1, task2, task3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model('List', listSchema);
// let retrievedItems;


app.get("/", async (req, res) => {
  
  await Item.find({}).then((items => {
  if (items.length === 0) {
    Item.insertMany(defaultItems).then((err) => {
      if(err) console.log(err)
      else console.log("Data inserting task successfull!")
    })
    res.redirect('/')
  }
  res.render("list", {listTitle: "Today", newListItems: items});
}));
});

app.post("/", async (req, res) => {
  
  const listName = req.body.list;
  const itemName = req.body.newItem;
  const newItem = new Item({name: itemName});
  if (listName === "Today") {
    newItem.save();
    res.redirect('/');  
  } else {
      await List.findOne({name: listName}).then(result => {
      result.items.push(newItem);
      result.save();
      res.redirect('/' + listName);
    })
  }
  
  
});

app.post("/delete", async (req, res) => {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === 'Today') {
    await Item.deleteOne({_id: itemId});
    res.redirect('/');
  } else {
    await List.findOneAndUpdate({name: listName}, {$pull: {item:{_id: itemId}}}).then(err => {
      if(!err) {
        res.redirect('/' + listName);
      }
    })
  }
  
})

app.get("/:listName", async (req,res) => {
  const listName = _.capitalize(req.params.listName);
  await List.findOne({name: listName}).then(result => {
    if(result) {
      res.render("list", {listTitle: listName, newListItems: result.items});
    } else {
      const list = new List({
          name: listName,
          items: defaultItems
      });
      list.save();
      res.redirect('/' + listName);
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
