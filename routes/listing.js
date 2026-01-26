const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const isLoggedIn = require("../middleware.js").isLoggedIn;
const isOwner = require("../middleware.js").isOwner;
const validateListing = require("../middleware.js").validateListing;
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
router
    .route("/")
    //all Listing route
    .get(wrapAsync(listingController.index))
    //create route
    .post(
        validateListing, 
        isLoggedIn,
        upload.single("listing[image]"),
        wrapAsync(listingController.createListing)
    );
  

//new route
router.get("/new", isLoggedIn, wrapAsync(listingController.newListingForm));


router
    .route("/:id")
    
    //show route
    .get(wrapAsync(listingController.showListing))
    //update route
    .put(validateListing, isLoggedIn, isOwner,  upload.single("listing[image]"), wrapAsync(listingController.updateListing))

    //delete route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing))
 

//edit route
    router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editListingForm));


module.exports = router;