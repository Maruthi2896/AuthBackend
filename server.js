const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const User = require("./models/userSchema");

// connect to express
const app = express();

// connect to db
mongoose
  .connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server started on the port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("Unable to connect  MongoDB", error);
  });

// middleware
app.use(cors());
app.use(bodyParser.json());

//Routes
//user registration
app.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User Created Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error signing UP" });
  }
});
// get user details
app.get("/register", async (req, res) => {
  try {
    const users = await User.find();
    res.status(201).json(users);
  } catch (error) {
    res.status(500).json({ error: "Unable to get users" });
  }
});

//post login

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.SCRETE_KEY, {
      expiresIn: "1hr",
    });
    res.json({ message: "Login successful!", token: token });
  } catch (error) {
    res.status(500).json({ error: "Error while logging in" });
  }
});
