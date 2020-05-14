const express = require("express");

const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.set("views", "views");

const path = require("path");

const adminRoutes = require("./routes/adminRoutes");

const shopRoutes = require("./routes/shopRoute");

const errorController = require("./controllers/404");

const mongoose = require('mongoose');

const User = require('./Models/User');

app.use(bodyParser.urlencoded({ extended: false }));

// app.use((req, res, next) => {
//     User.findById('5eb338e66f23bed6e5ed0fc3')
//         .then(user => {
//             req.user = new User(user.name, user.email, user.cart, user._id);
//             next();
//         })
//         .catch(err => {
//             console.log(err);
//         }
//     );
// });

app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);

app.use(shopRoutes);

app.use(errorController.get404Page);

mongoose.connect('mongodb+srv://nodeJS_app:kLWrZsC9Q4e8BQA@cluster0-ei6pt.mongodb.net/shop?retryWrites=true&w=majority', {
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




