const path = require("path");
const fs = require('fs');
const https = require('https');

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStoreSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const connectFlash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const nodeCompression = require('compression');
const morgan = require('morgan');

const environmentVariables = require('./config/envVars');

const MongoDbUriString = environmentVariables.MongoDbUri;

const app = express();
const mongoDbStore = new MongoDbStoreSession({
    uri: MongoDbUriString,
    collection: 'sessions'
});
const csrfProtection = csrf();

// const privateKey = fs.readFileSync('./server.key');
// const certificate = fs.readFileSync('./server.cert');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const adminRoutes = require("./routes/adminRoutes");
const shopRoutes = require("./routes/shopRoutes");
const authRoutes = require('./routes/authRoutes');
const errorController = require("./controllers/errorCtrl");

const accesLogStream = fs.createWriteStream(path.resolve(__dirname, 'logs', 'access.log'), 
{flags: 'a'}
);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(helmet());
app.use(nodeCompression());
app.use(morgan('combined', { stream: accesLogStream }));

const User = require('./Models/User');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
    storage: fileStorage,
    // dest: 'images'
    fileFilter: fileFilter
}).single('image'));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));
app.use(session({
    secret: 'my secret', 
    resave: false,
    saveUninitialized: false,
    store: mongoDbStore
}));
app.use(csrfProtection);
app.use(connectFlash());

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use((req, res, next) => {
    // throw new Error('Error');
    if(!req.session.user) {
        return next();
    }

    User
        .findById(req.session.user._id)
        .then(user => {
            if(!user) {
                return next();
            }

            req.user = user;
            next();
        })
        .catch(err => {
            next (new Error(err));
        });
    
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500Page);

app.use(errorController.get404Page);

app.use((error, req, res, next) => {
    res.status(500).render("500", {
        pageTitle: "Error",
        path: '/500',
        isLoggedIn: req.session.isLoggedIn
    });
});

mongoose.connect( MongoDbUriString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(result => {
    // https.createServer({
    //     key: privateKey,
    //     cert: certificate
    // }, app).listen(process.env.PORT || 3000);
    // console.log('Server is connected');
    app.listen(process.env.PORT || 3000, 
        console.log('Server has started!'))
})
.catch(err => {
    console.log(err);
});