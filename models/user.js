const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  }
});

// MUST be a function
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
