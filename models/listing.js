const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const review = require('./review.js');
const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    image: {
        filename: {
            type: String,
            default: "default_file.jpg"
        },
        url: {
            type: String,
        }
    },
    price: {
        type: Number,
        required: true
    },


    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
});
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await review.deleteMany({ _id: { $in: listing.reviews } });

    }
})

module.exports = mongoose.model("Listing", listingSchema);
