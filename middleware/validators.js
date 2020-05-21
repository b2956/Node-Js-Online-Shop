const { check, body } = require('express-validator');

const User = require('../Models/User');

exports.postSignUpValidator = [
    check('email') //checks anywhere
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail()
    .custom((value, { req }) => {
        
        return User
            .findOne({email: value})
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-mail already used, please pick a different one');
                }
            });
    }),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters.'
    ) // checks only in the designated field
    .isLength({
        min: 5
    })
    .isAlphanumeric()
    .trim(),
    body('confirmedPassword')
    .trim()
    .custom((value, { req }) => {
        if(value !== req.body.password) {
            throw new Error('Passwords have to match!');
        }
        return true;
    })

];
/*
exports.signUpValidator = check('email')
.isEmail()
.withMessage('Please enter a valid email')
.custom((value, {req}) => {
    if (value === 'test@test.com') {
        throw new Error('This email adress is forbidden.');
    }

    return true;
})
*/

exports.postLoginValidator = [
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail({
        gmail_remove_dots: false,
    }),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters.'
    )
    .isLength({
        min: 5
    })
    .isAlphanumeric()
    .trim(),
]

exports.postAddProductValidator = [
    body('title')
    .trim()
    .isAlphanumeric()
    .isLength({
        min: 3
    })
    .withMessage('Invalid Title'),
    body('imageUrl')
    .trim()
    .isURL()
    .withMessage('Invalid Image Url'),
    body('price')
    .isNumeric()
    .withMessage('Invalid Price'),
    body('description')
    .trim()
    .isLength({
        min: 5
    })
    .withMessage('Invalid Description')
]

exports.postEditProductValidator = [
    body('title')
    .trim()
    .isString()
    .withMessage('Title must be a String')
    .isLength({
        min: 3
    })
    .withMessage('Title must be at leat 3 characters long'),
    body('imageUrl')
    .trim()
    .isURL()
    .withMessage('Invalid Image Url'),
    body('price')
    .isFloat()
    .withMessage('Invalid Price'),
    body('description')
    .trim()
    .isLength({
        min: 5
    })
    .withMessage('Description must be at leat 5 characters long')
]
