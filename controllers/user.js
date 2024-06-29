import User from '../models/User.js';
import parseVErr from '../utils/parseValidationErrs.js';
import {processFoodItemForm, formattedDateEdit, processUserForm} from '../utils/formProcessor.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

const getUser = async (req, res) => {
  // const user = await User.findOne({ _id: req.user._id });
  req.user.data = req.session.data;
  res.render( 'edit-profile'/*, { user }*/);
};

const updateUser = async (req, res, next) => {
  console.log(req.body);
  const { user: { _id: userID, name: userName } } = req;
  const formData = processUserForm(req.body);
  console.log(formData);
  try {
    const user = await User.findOneAndUpdate({ _id: userID }, formData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      req.flash('error', `Error when updating User : ${userName}`);
      throw new BadRequestError(`Error when updating User : ${userName}`);
    };
    req.flash('info', `${user.name} updated successfully`);
  } catch (e) {
    if (e.constructor.name === 'ValidationError') {
      parseVErr(e, req);
      return res.render('edit-profile', { user: formData, errors: req.flash('error') });
    } else {
      console.log(e);
      return next(e);
    };
  };
  return res.redirect(`/main-window`);
};

export { getUser, updateUser };
