const User = require('../Models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');

const { api_key, domain } = require('../utilities/mailGunAPIKey');

const transporter = nodemailer.createTransport(mailgunTransport({
  auth: {
    api_key,
    domain
  }
}));

// var mailgun = require('mailgun-js')({
//   apiKey: apiKey, 
//   domain: domain
// });

exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie', 'loggedIn'));
    // const isLoggedIn = req
    //     .get('Cookie')
    //     .split(';')[0]
    //     .trim()
    //     .split('=')[1]
    // ;
    // console.log(req.session.isLoggedIn);
    let errorMessage = req.flash('error');
    if ( errorMessage.length > 0 ) {
      errorMessage = errorMessage[0];
    } else {
      errorMessage = null;
    }

    res.render('auth/login', {
      pageTitle: "User Login",
      path: "/login",
      errorMessage
    });
}

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User
    .findOne({ email : email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      bcrypt
      .compare(password, user.password)
      .then(doMatch => {
        if(!doMatch) {
          req.flash('error', 'Invalid email or password');
          return res.redirect('/login');
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
        req.flash('error', 'Invalid email or password');
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
  let errorMessage = req.flash('error');

  if ( errorMessage.length > 0 ) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  res.render('auth/signup', {
    pageTitle: 'Sign Up',
    path: '/signup',
    errorMessage
  })
}

exports.postSignUp = (req, res, next) => {
  const { email, password, confirmedPassword } = req.body;

  User.findOne({email: email})
  .then(userDoc => {
    if (userDoc) {
      req.flash('error', 'E-mail already used');
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
    .then(result => {
      // const emailOptions = {
      //   from: 'Node Shop <me@samples.mailgun.org>',
      //   to: email,        
      //   subject: 'Sign Up succeeded!',
      //   html: '<h1>You successfully signed up to our store!</h1>',
      // };
      res.redirect('/login');
      
      return transporter.sendMail({
        from: 'Node Shop <me@samples.mailgun.org>',
        to: email,        
        subject: 'Sign Up succeeded!',
        html: '<h1>You successfully signed up to our store!</h1>'
      });
      
      // return mailgun.messages().send(emailOptions, (error, body) => {
      //   if(error) {
      //     return console.log(error);
      //   } else {
      //     console.log("message sent!");
      //   }
      // });
    })
    .then(result => {
      console.log('sign up email sent');
    })
  })
  .catch(err => {
    console.log(err);
  });
}