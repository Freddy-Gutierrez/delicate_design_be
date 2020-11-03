const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
const Joi = require('joi');
const _ = require("lodash");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const {Review} = require('../models/review');
const { Product } = require("../models/product");


router.get("/:id", async (req, res) => {
  const product = await Product.isValidProduct(req.params.id);
  if (!product) return res.status(404).send("Product not found");

  let reviews = await Review.getReviews(req.params.id);
  console.log(reviews);
  return res.status(200).send(reviews[0]);
});

router.get("/:id/:rating", async (req, res) => {
  const product = await Product.isValidProduct(req.params.id);
  if (!product) return res.status(404).send("Product not found");

  const result = await Review.getReviews(req.params.id);  
  const filtered = result[0].reviews.filter((r) => r.rating == req.params.rating);
  return res.status(200).send(filtered);
});

// add review to corresponding product
router.post("/:id", [auth, validate(validateReview)], async (req, res) => {
  const { rating, review } = req.body;

  const product = await Product.isValidProduct(req.params.id);
  if (!product) return res.status(404).send("Product not found");

  let productReview = await Review.getReviews(req.params.id);  

  // register product in comments database
  if (productReview.length === 0){
    productReview = await new Review({
      productId: req.params.id,
      avgRating: "N/A",
      reviews: []
    });

    productReview.reviews.push({userId: req.user._id, name: req.user.username, rating, review});
    productReview.set({avgRating: rating});
    await productReview.save();

    product.set({avgRating: rating, totalReviews: productReview.reviews.length});
    await product.save();

    return res.status(200).send(productReview);
  }
  else{
    for (let c of productReview[0].reviews)
      if (String(req.user._id) === String(c.userId))
        return res.status(403).send("user may only comment once per candidate");

    productReview[0].reviews.push({ userId: req.user._id, name: req.user.username , rating, review });

    const avgRating = calcAvgRating(productReview[0].reviews);
    productReview[0].set({ avgRating });

    await productReview[0].save();

    product.set({avgRating: avgRating, totalReviews: productReview[0].reviews.length});
    await product.save();

    return res.status(200).send(productReview[0]);
  }  
});

// update a user comment product
router.put("/:id", [auth, validate(validateReview)], async (req, res) => {
  const { rating, name, comment: com } = req.body;
  const candidate = await Candidate.isValidCandidate(req.params.id);
  if (!candidate) return res.status(404).send("Candidate not found");

  for (let comment of candidate.comments) {
    if (String(req.user._id) === String(comment.userId)) {
      comment.set({
        name,
        rating,
        comment: com,
        date: Date.now(),
      });
      const avgRating = calcAvgRating(candidate.comments);
      candidate.set({ rating: avgRating });
      await candidate.save();
      return res.status(200).send(candidate);
    }
  }
  return res.status(404).send("User has not posted a comment yet");
});

// update helpful array 
router.put("/helpful/:id", [auth], async (req, res) => {
  const result = await Review.findOne({'reviews._id' : mongoose.Types.ObjectId(req.params.id)});  
  const reviewIndex = result.reviews.findIndex((r) => String(r._id) === String(req.params.id));
  let helpful = result.reviews[reviewIndex].helpful;

  if (helpful.includes(req.user._id)){
    const i = helpful.indexOf(req.user._id);
    helpful.splice(i, 1);    
    await result.save();
    return res.status(200).send(result);
  }

    helpful.push(mongoose.Types.ObjectId(req.user._id));
    await result.save();
    return res.status(200).send(result);
});

// calculates avg rating of a candidate
function calcAvgRating(reviews) {
  let avgRating = 0;
  for (let review of reviews) {
    avgRating += review.rating;
  }
  return (Math.round((avgRating /= reviews.length) * 10) / 10).toString();
}

function validateReview(review) {
  const schema = Joi.object({
    rating: Joi.number().required(),
    review: Joi.string().min(5).max(500).required(),
  });
  return schema.validate(review);
}

module.exports = router;
