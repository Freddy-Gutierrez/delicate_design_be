const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");


// authenticate user, then send user info to client
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).send(user);
});

// add new user
router.post("/", validate(validateUser), async (req, res) => {
  const { username, password } = req.body;
  const isAdmin = username === "freddyg" ? true : false;

  let user = await User.findOne({ username: username });
  if (user) return res.status(400).send("User already registered");

  const salt = await bcrypt.genSalt(10);
  user = await new User({
    username: username,
    password: password,
    isAdmin: isAdmin,
    salt: salt,
  });
  user.password = await bcrypt.hash(password, salt);
  user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "username"]));
});

// login user if valid credentials
router.post("/login", validate(validateUser), async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).send("User not found");

  await bcrypt.compare(password, user.password, (err, result) => {
    if (!result)
      return res.status(404).send("Username or password did not match");

    const token = user.generateAuthToken();
    res
      .status(200)
      .header("x-auth-token", token)
      .send(_.pick(user, ["_id", "username"]));
  });
});

// validate user using hapi/joi
function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).max(20).required(),
    password: Joi.string().min(5).max(20).required(),
  });

  return schema.validate(user);
}

module.exports = router;
