exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
      pageTitle: "User Login",
      path: "/login",
    });
}

exports.postLogin = (req, res, next) => {
    res.redirect('/');
}