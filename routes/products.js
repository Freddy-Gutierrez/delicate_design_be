const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require("../middleware/validate");
const { Product } = require('../models/product');

router.get('/', async(req, res) => {
    const products = await Product.find();
    res.status(200).send(products);
})

router.get('/tumblers', async(req, res) => {
    const products = await Product.find({productType:"Tumbler"});
    res.status(200).send(products);
})

router.get('/pillows', async(req, res) => {
    const products = await Product.find({productType:"Pillow"});
    res.status(200).send(products);
})


router.post("/", validate(validateProduct), async(req,res) => {
    const {src, alt, productType, title, description, price, avgRating} = req.body;
    const product = await new Product({
        src,
        alt, 
        productType,
         title, 
         description, 
         price, 
         avgRating
    });
    await product.save();
    res.status(200).send(product);
})

function validateProduct(product){
    const schema = Joi.object({
        src: Joi.string().required(),
        alt: Joi.string().min(5).max(30).required(),
        productType: Joi.string().required(),
        title: Joi.string().min(5).max(30).required(),
        description: Joi.string().min(5).max(500).required(),
        price: Joi.number().required(),
        avgRating: Joi.number().required()
    });
    return schema.validate(product);
}

module.exports = router;