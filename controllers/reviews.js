const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async(req,res)=>{
    const {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new Review saved");
    req.flash("success", "Successfully Added a Review");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async(req,res)=>{
    let {id,reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    req.flash("success", "Successfully Deleted a Review");
    res.redirect(`/listings/${id}`);
};