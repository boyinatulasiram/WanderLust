const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const isLoggedIn = require("../middleware.js").isLoggedIn;
const isOwner = require("../middleware.js").isOwner;
const validateListing = require("../middleware.js").validateListing;

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

module.exports.newListingForm = (req, res) => {
    // console.log("In New Route");
    // res.send("In New Route");
    res.render("./listings/new.ejs")
}

module.exports.showListing = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path:"reviews",
        populate:{
            path:"author",
        }
    }).populate("owner");
    
    if(!listing){
        req.flash("error", "Listing you are looking for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Successfully Created a new Listing");
    res.redirect("/listings");
}

module.exports.editListingForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you are looking for does not exist");
        return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", { listing });
}

module.exports.updateListing = async (req, res) => {
   const { id } = req.params;
    if (!req.body.listing) {
        throw new ExpressError(400, "Send Valid Data for Listing");
    }
    
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Successfully Updated a Listing");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const delListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", delListing);
    req.flash("success", "Successfully Deleted a Listing");
    res.redirect("/listings");
}