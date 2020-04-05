const Joi = require('@hapi/joi');

const createUserSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required(),

    username: Joi.string()
        .alphanum()
        .min(5)
        .max(50)
        .required(),

    pwd: Joi.string()
        .base64({ paddingRequired: true })
        .min(5)
        .max(50)
        .required(),

    repeatPwd: Joi.ref('pwd'),

    // access_token: [
    //     Joi.string(),
    //     Joi.number()
    // ],

    role: Joi.string()
        .min(3)
        .max(50)
        .valid('admin', 'user','doctor')
        .required()
})
// .with('username', 'birth_year')
// .xor('password', 'access_token')
// .with('password', 'repeat_password');

const updateUserSchema = Joi.object({

    username: Joi.string()
        .alphanum()
        .min(5)
        .max(50)
        .required(),

    role: Joi.string()
        .min(3)
        .max(50)
        .valid('admin', 'user','doctor')
        .required()
})

module.exports = {
    createUserSchema,
    updateUserSchema
}