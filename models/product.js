const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    src: {type: String, required: true},
    alt: {type: String, required: true},
    productType: {type: String, enum: ['Shirt', 'Pillow', 'Tumbler','Tote', 'Topper', 'Banner'], required: true},
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    avgRating: {type: Number, required: true}
});

// static function that checks if candidate exists in DB
schema.statics.isValidProduct = function (id) {
    try {
        return this.findById(mongoose.Types.ObjectId(id));   
    } catch (error) {
        return null;
    }  
};

const Product = mongoose.model("Products", schema);

exports.Product = Product;