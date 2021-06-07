exports.get404 = (req, res, next) => {
  res
    .status(404)
    .render('404', {
      docTitle: 'Page Not Found',
      path: '/404',
      isAuthenticated: req.session.isLoggedIn && req.session.user,
    });
};
