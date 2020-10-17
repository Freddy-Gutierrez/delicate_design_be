const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = mongoose.Schema({
  username: { type: String, required: true, minLength: 5, maxLength: 20 },
  password: { type: String, required: true, minLength: 5, maxLength: 20 },
});

// custom user method to generate an auth token using JWT
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, username: this.username },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

exports.User = User;