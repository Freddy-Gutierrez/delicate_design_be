const mongoose = require("mongoose");

const reviewInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId },
  name: { type: String },
  rating: { type: Number, required: true },
  review: { type: String, required: true, trim: true, lowercase: true },
  helpful: {type: [mongoose.Types.ObjectId], default: []},
  date: { type: String},
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
