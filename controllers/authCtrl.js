const User = require('../Models/User');

exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie', 'loggedIn'));
    // const isLoggedIn = req
    //     .get('Cookie')
    //     .split(';')[0]
    //     .trim()
    //     .split('=')[1]
    // ;
    // console.log(req.session.isLoggedIn);

    res.render('auth/login', {
      pageTitle: "User Login",
      path: "/login",
      isLoggedIn: req.session.isLoggedIn
    });
}

exports.postLogin = (req, res, next) => {
  User
    .findById('5ebdb631e8294f6040b37172')
    .then(user => {
      // console.log(user);
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => {
      console.log(err);
    }
  );
  // res.setHeader('Set-Cookie', 'loggedIn=true'); //  Expires=date Max-Age=time in seconds; Domain=tracking domain; Secure for https, HttpOnly;
  
}

exports.postLogout= (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
}