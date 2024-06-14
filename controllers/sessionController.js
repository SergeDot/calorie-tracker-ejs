import User from '../models/User.js';
import parseVErr from '../utils/parseValidationErrs.js';

const registerShow = (req, res) => res.render('register', { credentials: undefined });

const registerDo = async (req, res, next) => {
  let credentials = {};
  const { name, email, password, password1 } = req.body;
  credentials.name = name;
  credentials.email = email;
  if (password != password1) {
    req.flash('error', 'The passwords entered do not match.');
    return res.render('register', { errors: req.flash('error'), credentials });
  };
  try {
    await User.create(req.body);
  } catch (e) {
    if (e.constructor.name === 'ValidationError') {
      parseVErr(e, req);
    } else if (e.name === 'MongoServerError' && e.code === 11000) {
      req.flash('error', 'This email address is already registered. Do you want to login instead?');
    } else {
      return next(e);
    };
    return res.render('register', { errors: req.flash('error'), credentials });
  };
  req.flash('info', 'Registration is successful.');
  res.redirect('/');
};

const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    };
    res.redirect('/');
  });
};

const logonShow = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  };
  res.render('logon');
};

export {
  registerShow,
  registerDo,
  logoff,
  logonShow,
};
