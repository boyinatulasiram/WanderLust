const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router({ mergeParams: true });
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware.js");
const  userController  = require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signUp));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(savedRedirectUrl, 
    passport.authenticate("local", 
        { failureFlash: true, failureRedirect: "/login" }), 
    wrapAsync(userController.login));

router.get("/logout", userController.logout)

module.exports = router;