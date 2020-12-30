const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Joi = require('joi');
const moment = require('moment-timezone');
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { Order } = require('../models/order');

router.post("/", [auth, validate(validateOrder)], async (req, res) => {
    const {payment_method, total, order_details} = req.body;
    const orders = await new Order({
        customer_id: mongoose.Types.ObjectId(req.user._id),
        payment_method,
        order_status: "Pending",
        date_placed: moment.tz(moment(),'America/Los_Angeles').format("dddd, MMMM Do YYYY, h:mm:ss"),
        total,
        order_details
    });

    await orders.save();

    res.send(orders).status(200);
});

function validateOrder(order) {
    const schema = Joi.object({
      payment_method: Joi.string().min(5).max(20).required(),
      total: Joi.number().required(),
      order_details: Joi.string().min(5).max(500).required(),
    });
    return schema.validate(order);
}

module.exports = router;