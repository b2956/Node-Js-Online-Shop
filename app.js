const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStoreSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const connectFlash = require('connect-flash');

const MongoDbUriString = 'mongodb+srv://nodeJS_app:kLWrZsC9Q4e8BQA@cluster0-ei6pt.mongodb.net/shop?retryWrites=true&w=majority';

const app = express();
const mongoDbStore = new MongoDbStoreSession({
    uri: MongoDbUriString,
    collection: 'sessions'
});
const csrfProtection = csrf();

const adminRoutes = require("./routes/adminRoutes");
const shopRoutes = require("./routes/shopRoutes");
const authRoutes = require('./routes/authRoutes');
const errorController = require("./controllers/404");

app.set("view engine", "ejs");
app.set("views", "views");

const User = require('./Models/User');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
    secret: 'my secret', 
    resave: false,
    saveUninitialized: false,
    store: mongoDbStore
}));
app.use(csrfProtection);
app.use(connectFlash());

app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }

    User
        .findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
        });
    
});

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404Page);

mongoose.connect( MongoDbUriString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(result => {
    app.listen(3000);
    console.log('Server is connected');
})
.catch(err => {
    console.log(err);
});




