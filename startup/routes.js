const express = require("express");
const users = require("../routes/users");
const products = require("../routes/products");
const reviews = require("../routes/reviews");
const orders = require("../routes/orders");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/products", products);
  app.use("/api/users", users);
  app.use("/api/reviews", reviews);
  app.use("/api/orders", orders)
};