const express = require("express");
const users = require("../routes/users");
const products = require("../routes/products");
const comments = require("../routes/comments");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/products", products);
  app.use("/api/users", users);
  app.use("/api/comments", comments);
};