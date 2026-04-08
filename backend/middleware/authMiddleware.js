const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  req.flash('error', 'Please log in to access the admin panel.');
  res.redirect('/admin/login');
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/');
  }
  next();
};

module.exports = { isAuthenticated, isGuest };