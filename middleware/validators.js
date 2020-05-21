const { check, body } = require('express-validator');

const User = require('../Models/User');

exports.postSignUpValidator = [
    check('email') //checks anywhere
    .isEmail()
    .withMessage('Please enter a valid email')
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
    .isAlphanumeric(),
    body('confirmedPassword')
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
    .withMessage('Please enter a valid email'),
    body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters.'
    )
    .isLength({
        min: 5
    })
    .isAlphanumeric(),
]
