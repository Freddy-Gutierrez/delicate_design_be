const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    customer_id: {type: mongoose.Types.ObjectId, required: true },
    payment_method: {type: String, enum:["Credit Card", "Debit Card","PayPal"], required: true},
    order_status: {type: String, maxlength: 20},
    date_placed: {type: String},
    total: {type: Number, required: true},
    order_details: {type: String, required: true}
});

const Order = mongoose.model("Orders", schema);

exports.Order = Order;