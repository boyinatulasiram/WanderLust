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
     const place = req.body.listing.location;
     const apiKey = process.env.MAP_TOKEN;

    const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(place)}.json?key=${apiKey}`;

     const geoRes = await fetch(geoUrl);
     const geoData = await geoRes.json();

    if (!geoData.features || geoData.features.length === 0) {
      req.flash("error", "Location not found");
      return res.redirect("/listings/new");
    }

    const [lng, lat] = geoData.features[0].center;

    const newListing = new Listing(req.body.listing);

    newListing.geometry = {
      type: "Point",
      coordinates: [lng, lat]
    };

   if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }
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
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250/");
    res.render("./listings/edit.ejs", { listing , originalImageUrl});
}

module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.body.listing) {
      throw new ExpressError(400, "Send Valid Data for Listing");
    }

    const place = req.body.listing.location;
    const apiKey = process.env.MAP_TOKEN;

    const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      place
    )}.json?key=${apiKey}`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.features || geoData.features.length === 0) {
      req.flash("error", "Location not found");
      return res.redirect(`/listings/${id}/edit`);
    }

    const [lng, lat] = geoData.features[0].center;

    const listing = await Listing.findByIdAndUpdate(
      id,
      {
        ...req.body.listing,
        geometry: {
          type: "Point",
          coordinates: [lng, lat]
        }
      },
      { new: true }
    );

    if (!listing) {
      req.flash("error", "Listing does not exist");
      return res.redirect("/listings");
    }

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
      await listing.save();
    }

    req.flash("success", "Successfully updated listing");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
};


module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    const delListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", delListing);
    req.flash("success", "Successfully Deleted a Listing");
    res.redirect("/listings");
}