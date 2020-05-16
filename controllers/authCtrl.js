const User = require('../Models/User');
const bcrypt = require('bcryptjs');

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
  const { email, password } = req.body;

  User
    .findOne({ email : email })
    .then(user => {
      if (!user) {
        return res.redirect('/login');
      }
      bcrypt
      .compare(password, user.password)
      .then(doMatch => {
        if(!doMatch) {
          return res.redirect('login');
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err) => {
          console.log(err);
          res.redirect('/');
        });
      })
      .catch(err => {
        console.log(err);
        res.redirect('/login');
      })
    })
    .catch(err => {
      console.log(err);
    }
  );
  // res.setHeader('Set-Cookie', 'loggedIn=true'); //  Expires=date Max-Age=time in seconds; Domain=tracking domain; Secure for https, HttpOnly;
  
}

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
}

exports.getSignUp = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    path: '/signup',
    isLoggedIn: req.session.isLoggedIn
  })
}

exports.postSignUp = (req, res, next) => {
  const { email, password, confirmedPassword } = req.body;

  User.findOne({email: email})
  .then(userDoc => {
    if (userDoc) {
      return res.redirect('/signup');
    }

    return bcrypt
    .hash(password, 12)
    .then(hashedPassword => {

      const user = new User({
        email,
        password: hashedPassword,
        cart: {
          items: []
        }
      });
  
      return user.save();
    })
    .then(user => {
      res.redirect('/login');
    });
  })
  .catch(err => {
    console.log(err);
  });
}