const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const Listing = require("./models/listing.js")

app.set("view enegine","ejs");
app.set("views", path.join(__dirname, "views"));

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
app.get("/listings/new", async(req,res) =>{
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
    let {title, description, image, price, location, country} = req.body.listing;
    const newListing = new Listing({title,description,image,price,location,country});
    await newListing.save();
    res.redirect("/listings");
})

app.listen(8080,() =>{
    console.log("Server is running on port 8080");
})