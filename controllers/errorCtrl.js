exports.get404Page = (req, res, next) => {
    res.status(404).render("404", {
        pageTitle: "404 Page Not Found",
        path: '/404',
        isLoggedIn: req.session.isLoggedIn
    });
};

exports.get500Page = (req, res, next) => {
    res.status(500).render("500", {
        pageTitle: "Error",
        path: '/500',
        isLoggedIn: req.session.isLoggedIn
    });
};