import Activity from '../models/Activity.js';
import parseVErr from '../utils/parseValidationErrs.js';
import {processActivityForm, formattedDateEdit} from '../utils/formProcessor.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

let updateToggle = true;
let showDate;
  
const getAllActivities = async (req, res) => {
  let activities = await Activity.find({ createdBy: req.user._id }).sort('createdAt');
  showDate = formattedDateEdit(req.query.date);
  // showDate = req.session.showDate;
  activities = activities.filter(item => formattedDateEdit(item.activityDate) === showDate);

  const numberOfActivities = activities.length;
  if (!numberOfActivities) {
    req.flash('activityInfo', 'No activities for this day');
  } else {
    req.flash('activityInfo', `${numberOfActivities} ${numberOfActivities == 1 ? 'activity' : 'activities'} for this day`);
  };
  return { activities: activities, activityInfo: req.flash('activityInfo') };
};

const showAddEditActivity = async (req, res, next) => {
  if (Object.keys(req.params).length) {
    updateToggle = true;
    try {
      const { user: { _id: userID }, params: { id: activityId } } = req;
      const activity = await Activity.findOne({ _id: activityId, createdBy: userID });
      if (!activity) {
        req.flash('error', `No Food Item with ID : ${activityId} at user ${userID}`);
        return res.redirect(`/main-window?date=${showDate}`);
      };
      return res.render('activity', { activity, updateToggle, showDate });
    } catch (e) {
      return next(e);
    };
  };
  updateToggle = false;
  res.render('activity', { activity: null, updateToggle, showDate });
};

const addActivity = async (req, res, next) => {
  updateToggle = false;
  req.body.createdBy = req.user._id;
  const formData = processActivityForm(req.body);
  try {
    const activity = await Activity.create(formData);
    req.flash('info', `${activity.type} added successfully`);
  } catch (e) {
    if (e.constructor.name === 'ValidationError') {
      parseVErr(e, req);
      return res.render('activity', { activity: formData, errors: req.flash('error'), updateToggle, showDate });
    } else {
      console.log(e);
      return next(e);
    };
  };
  return res.redirect(`/main-window?date=${showDate}`);
};

const updateActivity = async (req, res, next) => {
  const { user: { _id: userID }, params: { id: activityId } } = req;
  const formData = processActivityForm(req.body);
  try {
    const activity = await Activity.findOneAndUpdate({ _id: activityId, createdBy: userID }, formData, {
      new: true,
      runValidators: true
    });
    if (!activity) {
      req.flash('error', `Error when updating a Food Item with ID : ${activityId} at user ${userID}`);
      throw new BadRequestError(`Error when updating a Food Item with ID : ${activityId} at user ${userID}`);
    };
    req.flash('info', `${activity.name} updated successfully`);
  } catch (e) {
    if (e.constructor.name === 'ValidationError') {
      parseVErr(e, req);
      const activity = await Activity.findOne({ _id: activityId, createdBy: userID });
      return res.render(
        'activity', 
        { 
          activity: { activity: activity, ...formData }, 
          errors: req.flash('error'), 
          updateToggle, 
          showDate 
        });
    } else {
      console.log(e);
      return next(e);
    };
  };
  return res.redirect(`/main-window?date=${showDate}`);
};

const deleteActivity = async (req, res) => {
  const { user: { _id: userID }, params: { id: activityId } } = req;
  try {
    const activity = await Activity.findOneAndDelete({ _id: activityId, createdBy: userID });
    if (!activity) {
      req.flash('error', `Error when deleting an Activity with ID : ${activityId} at user ${userID}`);
      throw new BadRequestError(`Error when deleting an Activity with ID : ${activityId} at user ${userID}`);
    };
    req.flash('info', `${activity.name} deleted successfully`);
  } catch (e) {
    console.log(e);
    return next(e);
  };
  res.redirect(`/main-window?date=${showDate}`);
};

export { getAllActivities, addActivity, showAddEditActivity, updateActivity, deleteActivity };
