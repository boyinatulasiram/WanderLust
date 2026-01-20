const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, password, email } = req.body;
        newUser = await new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect(req.session.redirectUrl);
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", savedRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), wrapAsync(async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust Logged in Successfully!");
    res.redirect(res.locals.redirectUrl || "/listings");
}));

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out Successfully!");
        res.redirect("/listings");
    })
})
module.exports = router;