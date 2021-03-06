const Joi = require('@hapi/joi'); // use hapi/joi module for schema validation

// Posts' schema for validation
const postSchema = Joi.object({

    user_id: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','gr'] } }) // email should consist of min 2 domain segments (gmail.com) and end with [com,net,gr]
        .required(), // parameter is required

    title: Joi.string()
        .min(5)
        .max(1000)
        .required(),

    body: Joi.string()
        .min(5)
        .max(20000)
        .required(),

    category: Joi.string()
        .min(3)
        .max(50)
        .required()
})

module.exports = {
    postSchema
}