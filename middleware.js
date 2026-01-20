const Listing = require("./models/listing");
const { listingSchema } = require("./schema");
const ExpressError = require("./utils/ExpressError");
const reviewSchema= require("./schema").reviewSchema;
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //redirect url
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a new listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.savedRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    
    let listing = await Listing.findById(id);
    if (!res.locals.currentUser) {
        req.flash("error", "You must be logged in first");
        return res.redirect("/login");
    }
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not authorized to do that");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        // return next(new ExpressError(400,errMsg));
    }
    next();

}

module.exports.validateReview = (req,res,next) =>{
     let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(400,errMsg));
    } else{
        next();
    }
}