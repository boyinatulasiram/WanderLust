const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");



const validateReview = (req,res,next) =>{
     let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400,errMsg));
    } else{
        next();
    }
}


//post review route
router.post("/",validateReview,wrapAsync(async(req,res)=>{
    const {id} = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    console.log("new Review saved");
    req.flash("success", "Successfully Added a Review");
    res.redirect(`/listings/${id}`);
}));

//delete review route
router.delete("/:reviewId", wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    req.flash("success", "Successfully Deleted a Review");
    res.redirect(`/listings/${id}`);
}))

module.exports = router;