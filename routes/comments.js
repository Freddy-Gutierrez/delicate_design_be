const express = require("express");
const router = express.Router();
const Joi = require('joi');
const _ = require("lodash");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const {Comment} = require('../models/comment');
const { Product } = require("../models/product");

router.get("/:id", async (req, res) => {
  const product = await Product.isValidProduct(req.params.id);
  if (!product) return res.status(404).send("Product not found");

  let comments = await Comment.getComments(req.params.id);
  return res.status(200).send(comments);
});

// add comment to corresponding candidate if user is logged in and hasn't commented yet
router.post("/:id", [auth, validate(validateComment)], async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.isValidProduct(req.params.id);
  if (!product) return res.status(404).send("Product not found");

  let productComment = await Comment.getComments(req.params.id);  

  // register product in comments database
  if (productComment.length === 0){
    productComment = await new Comment({
      productId: req.params.id,
      avgRating: "N/A",
      comments: []
    });

    productComment.comments.push({userId: req.user._id, name: req.user.username, rating, comment});
    productComment.set({avgRating: rating});
    await productComment.save();

    return res.status(200).send(productComment);
  }
  else{
    for (let c of productComment[0].comments)
      if (String(req.user._id) === String(c.userId))
        return res.status(403).send("user may only comment once per candidate");

    productComment[0].comments.push({ userId: req.user._id, name: req.user.username , rating, comment });

    const avgRating = calcAvgRating(productComment[0].comments);
    productComment[0].set({ avgRating });

    await productComment[0].save();

    return res.status(200).send(productComment[0]);
  }  
});

// update a user comment on a candidate
router.put("/:id", [auth, validate(validateComment)], async (req, res) => {
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

// calculates avg rating of a candidate
function calcAvgRating(comments) {
  let avgRating = 0;
  for (let comment of comments) {
    avgRating += comment.rating;
  }
  return (Math.round((avgRating /= comments.length) * 10) / 10).toString();
}

function validateComment(comment) {
  const schema = Joi.object({
    rating: Joi.number().required(),
    comment: Joi.string().min(5).max(500).required(),
  });
  return schema.validate(comment);
}

module.exports = router;
