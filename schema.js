const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        country: Joi.string().required(),
        location: Joi.string().required(),
        price: Joi.number().min(0).required(),
        image: Joi.object({
            url: Joi.string().uri().optional(),
            filename: Joi.string().allow("")
        }).optional()
    }).required()
});
