const express = require("express");
const products = require("../routes/products");
const users = require("../routes/users");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/products", products);
  app.use("/api/users", users);
};