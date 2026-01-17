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
            default:
                "https://media.istockphoto.com/id/1453462931/photo/maldives-hotel-beach-resort-on-tropical-island-with-aerial-drone-view.webp",
            set: v =>
                v === ""
                    ? "https://media.istockphoto.com/id/1453462931/photo/maldives-hotel-beach-resort-on-tropical-island-with-aerial-drone-view.webp"
                    : v
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
    ]
});
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await review.deleteMany({ _id: { $in: listing.reviews } });

    }
})

module.exports = mongoose.model("Listing", listingSchema);
