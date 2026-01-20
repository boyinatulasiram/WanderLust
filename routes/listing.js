const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const isLoggedIn = require("../middleware.js").isLoggedIn;
const isOwner = require("../middleware.js").isOwner;
const validateListing = require("../middleware.js").validateListing;

//all Listing route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
}));

//new route
router.get("/new", isLoggedIn, wrapAsync((req, res) => {
    // console.log("In New Route");
    // res.send("In New Route");
    res.render("./listings/new.ejs")
}));

//show route
router.get("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");

    res.render("listings/show.ejs", { listing });
}));

//create route
router.post("/", validateListing,isLoggedIn, wrapAsync(async (req, res, next) => {

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Successfully Created a new Listing");
    res.redirect("/listings");
}));

//edit route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you are looking for does not exist");
        return res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", { listing });
}));

//update route
router.put("/:id", validateListing, isLoggedIn, isOwner, wrapAsync(async (req, res) => {
   const { id } = req.params;
    if (!req.body.listing) {
        throw new ExpressError(400, "Send Valid Data for Listing");
    }
    
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Successfully Updated a Listing");
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id", isLoggedIn,isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const delListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", delListing);
    req.flash("success", "Successfully Deleted a Listing");
    res.redirect("/listings");
}));

module.exports = router;