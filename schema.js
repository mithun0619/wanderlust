const Joi=require("joi");

const allowedCategories = [
    "Trending",
    "Rooms",
    "Iconic Cities",
    "Mountains",
    "Castles",
    "Amazing Pools",
    "Camping",
    "Farms",
    "Arctic",
    "Domes",
    "Boat",
    "Other",
];

module.exports.listingSchema=Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description : Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        price:Joi.number().required().min(0),
        category: Joi.alternatives().try(
            Joi.string().valid(...allowedCategories),
            Joi.array().items(Joi.string().valid(...allowedCategories)).min(1)
        ),
        image:Joi.string().allow("",null)
}).required()
})

module.exports.reviewSchema=Joi.object({
    review: Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required()
});
