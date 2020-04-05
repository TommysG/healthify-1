const Joi = require('@hapi/joi'); // use hapi/joi module for schema validation

// createUser schema for validation
const createUserSchema = Joi.object({

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','gr'] } }) // email should consist of min 2 domain segments (gmail.com) and end with [com,net,gr]
        .required(), // parameter is required

    username: Joi.string()
        .alphanum()
        .min(5)
        .max(50)
        .required(),

    pwd: Joi.string()
        .base64({ paddingRequired: true }) // must be base64 encoded
        .min(5)
        .max(50)
        .required(),

    repeatPwd: Joi.ref('pwd'), // must match pwd

    // access_token: [
    //     Joi.string(),
    //     Joi.number()
    // ],

    role: Joi.string()
        .min(3)
        .max(50)
        .valid('admin', 'user','doctor') // enum values [admin, user, doctor]
        .required()
})
// .with('username', 'birth_year')
// .xor('password', 'access_token')
// .with('password', 'repeat_password');

// updateUser schema for validation
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