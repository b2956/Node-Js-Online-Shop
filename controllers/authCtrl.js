const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
const { validationResult } = require('express-validator');

const User = require('../Models/User');
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
      errorMessage,
      oldInput: {
        email: '',
        password: '',
      },
      validationErrors: []
    });
}

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array()
    });
  }

  User
    .findOne({ email : email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: '/login',
          errorMessage: 'Invalid Email',
          oldInput: {
            email,
            password,
          },
          validationErrors: [{param: 'email'}]
        });
      }
      bcrypt
      .compare(password, user.password)
      .then(doMatch => {
        if(!doMatch) {
          return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: 'Invalid password',
            oldInput: {
              email,
              password,
            },
            validationErrors: [{param: 'password'}]
          });
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
    if (err) { console.log(err); }
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
    errorMessage,
    oldInput: {
      email: '',
      password: '',
      confirmedPassword: ''
    },
    validationErrors: []
  })
}

exports.postSignUp = (req, res, next) => {
  const errors = validationResult(req);
  // console.log(errors.array());

  const { email, password, confirmedPassword } = req.body;

  if(!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'Sign Up',
      path: '/signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmedPassword
      },
      validationErrors: errors.array()
    });
  }

  bcrypt
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

      res.redirect('/login');
        
      return transporter.sendMail({
        from: 'Node Shop <me@samples.mailgun.org>',
        to: email,        
        subject: 'Sign Up succeeded!',
        html: '<h1>You successfully signed up to our store!</h1>'
      });
        
    })
    .then(result => {
      console.log('sign up email sent');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getResetPassword = (req, res, next) => {
  let errorMessage = req.flash('error');

  if ( errorMessage.length > 0 ) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  res.render('auth/reset-password', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage
  });
};

exports.postResetPassword = (req, res, next) => {
  const { email } = req.body;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset-password');
    }

    const token = buffer.toString('hex');

    User.findOne({ 
      email : email 
    })
    .then(user => {
      if(!user) {
        req.flash('error', 'No account with that email found!');
        return res.redirect('/reset-password');
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;

      return user.save()
      .then(result => {
        res.redirect('/');
  
        transporter.sendMail({
          from: 'Node Shop <me@samples.mailgun.org>',
          to: email,        
          subject: 'Password Reset',
          html: `
            <h1>Here's your password reset link!</h1>
            <nbr></nbr>
            <p>This is the <a href="http://localhost:3000/set-new-password/${token}">link</a> for reseting your password, if you didn't ask for a password reset don't click it, it will expire in 1 hour.</p>
          `
        });
      })
      .then(result => {
        console.log('Reset password email sent!')
      })
    })
    .catch(err => {
      console.log(err);
    })

  });
};

exports.getSetNewPassword = (req, res, next) => {
  const { token } = req.params;

  User
  .findOne({ 
    resetToken: token,
    resetTokenExpiration: {
      $gt: Date.now()
    } 
  })
  .then(user => {

    if(!user) {
      req.flash('error', 'Invalid password reset link');
      return res.redirect('/login');
    }

    res.render('auth/set-new-password', {
      path: '/set-new-password',
      pageTitle: 'Set new Password',
      userId: user._id.toString(),
      token
    });
  })
  .catch(err => {
    console.log(err);
  })

  
};

exports.postSetNewPassword = (req, res, next) => {
  const { password, userId, token } = req.body;
  let user;

  User
  .findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
  .then(retrievedUser => {
    user = retrievedUser;

    return bcrypt
    .hash(password, 12);
  })
  .then(hashedPassword => {
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    return user.save();    
  })
  .then(result => {
    console.log('Password changed');
    res.redirect('/login');
  })
  .catch(err => {
    console.log(err);
  });
};