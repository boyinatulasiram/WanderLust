if(process.env.NODE_ENV != "production"){
    require("dotenv").config()
}
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo")
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const dbUrl = process.env.ATLASDB_URL;
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter:24*60*60,
});
store.on("error", ()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});
const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
}

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

main()
    .then(() => {
        console.log("Connected to MongoDB server");
    }).catch(err => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(dbUrl);
}


app.use(session(sessionOptions));
app.use(flash());

//using passport for authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
}) 

 //listings route
 app.use("/listings",listingsRouter);

//reviews route
app.use("/listings/:id/reviews",reviewsRouter);

//user route
app.use("/",userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found !"));
});


//middleware for Handling Errors
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Some error" } = err;
    //res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
