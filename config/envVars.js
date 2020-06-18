const path = require('path');

const dotenv = require('dotenv').config({
    path: path.resolve(__dirname, 'envVars.env')
});

module.exports = {
    MongoDbUri: process.env.MONGO_DB_URI,
    MailgGunDomain: process.env.MAILGUN_DOMAIN,
    MailGunApi_Key: process.env.MAILGUN_API_KEY,
    StripeApiKey: process.env.STRIPE_API_KEY,
}

