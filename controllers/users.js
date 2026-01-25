
const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    console.log("rendering signup page");
    res.render("users/signup.ejs");
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.signUp = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect(res.locals.redirectUrl || "/listings");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};


module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust Logged in Successfully!");
    res.redirect(res.locals.redirectUrl || "/listings");
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logged out Successfully!");
        res.redirect("/listings");
    })
}