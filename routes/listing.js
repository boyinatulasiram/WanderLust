const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const isLoggedIn = require("../middleware.js").isLoggedIn;
const isOwner = require("../middleware.js").isOwner;
const validateListing = require("../middleware.js").validateListing;
const listingController = require("../controllers/listing.js");
//all Listing route
router.get("/", wrapAsync(listingController.index));

//new route
router.get("/new", isLoggedIn, wrapAsync(listingController.newListingForm));

//show route
router.get("/:id", wrapAsync(listingController.showListing));

//create route
router.post("/", validateListing, isLoggedIn, wrapAsync(listingController.createListing));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListingForm));

//update route
router.put("/:id", validateListing, isLoggedIn, isOwner, wrapAsync(listingController.updateListing));

//delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;