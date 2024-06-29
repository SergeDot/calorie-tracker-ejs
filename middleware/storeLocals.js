const storeLocals = (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  } else {
    res.locals.user = null;
  }
  res.locals.info = req.flash('info');
  res.locals.errors = req.flash('error');
  res.locals.foodItemInfo = req.flash('foodItemInfo');
  res.locals.activityInfo = req.flash('activityInfo');
  next();
};

export default storeLocals;
