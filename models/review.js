const mongoose = require("mongoose");
const moment = require('moment');
const { filter } = require("lodash");

const reviewInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId },
  name: { type: String },
  rating: { type: Number, required: true },
  review: { type: String, required: true, trim: true, lowercase: true },
  helpful: {type: Number, default: 0},
  date: { type: String, default: moment().format("dddd, MMMM Do YYYY, h:mm:ss a") },
});

const reviewSchema = mongoose.Schema({
  productId: { type: mongoose.Types.ObjectId },
  avgRating: {type: String},
  reviews: [reviewInfoSchema]
});

reviewSchema.statics.getReviews = function (id) {
    return this.find({productId: id});
};

const Review = mongoose.model("Review", reviewSchema);

exports.Review = Review;
