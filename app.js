//jshint esversion:
require("dotenv").config();
const express = require("express");

const ejs = require("ejs");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.SECRETS);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRETS,
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/register", async function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  try {
    await newUser.save();
    res.render("secrets");
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const foundUser = await User.findOne({ email: username });
    if (foundUser) {
      if (foundUser.password === password) {
        res.render("secrets");
      }
    }
  } catch (error) {
    console.log("Error loging in : ", error);
  }
});

app.listen(3000, function () {
  console.log("Server running on port 3000");
});
