const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const Listing = require("./models/listing.js");
const listing = require("./models/listing.js");
const methodOverride = require("method-override");
app.set("view enegine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() =>{
    console.log("Connected to MongoDB server");
}).catch(err =>{
    console.log(err);
})

 async function main() {
    await mongoose.connect(MONGO_URL);
 }

app.get("/",(req,res) =>{
    res.send("I am Root");
});

// app.get("/testlisting", async (req,res) =>{
//     const list = new Listing({
//         title : "My House",
//         description:"This is a sample test listing",
//         price:5000,
//         location:"Vijayawada",
//         country:"India"
//     });
//     await list.save().then(() =>{
//          console.log("saved test sample");
//          res.send("SUccesful");
//     }) . catch((err) =>{
//         console.log(err);
//     });
// })

//all Listing route
app.get("/listings", async(req,res) =>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
})

//new route
app.get("/listings/new", (req,res) =>{
    res.render("./listings/new.ejs")
})

//show route
app.get("/listings/:id", async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", {listing});
})

//create route
app.post("/listings", async(req,res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
//edit route
app.get("/listings/:id/edit",async(req,res) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs",{listing});
});

//update route
app.put("/listings/:id",async(req,res) =>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})
//delete route
app.delete("/listings/:id",async(req,res) =>{
    const {id} = req.params;
    const delListing = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:",delListing);
    res.redirect("/listings");
})
app.listen(8080,() =>{
    console.log("Server is running on port 8080");
})