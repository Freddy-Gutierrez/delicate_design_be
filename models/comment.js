const mongoose = require("mongoose");
const moment = require('moment'); // require

const commentInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId },
  name: { type: String },
  rating: { type: Number, required: true },
  comment: { type: String, required: true, trim: true, lowercase: true },
  date: { type: String, default: moment().format("dddd, MMMM Do YYYY, h:mm:ss a") },
});

const commentSchema = mongoose.Schema({
  productId: { type: mongoose.Types.ObjectId },
  avgRating: {type: String},
  comments: [commentInfoSchema]
});

// static function that checks if candidate exists in DB
commentSchema.statics.getComments = function (id) {
    return this.find({productId: id});
   
};

const Comment = mongoose.model("Comment", commentSchema);

exports.Comment = Comment;
