import { getAllFoodItems } from '../controllers/food-items.js';
import { getAllActivities } from '../controllers/activities.js';
import { formattedDateEdit, calculateCalories, reverseUserForm } from '../utils/formProcessor.js';

// TODO: add date query validation
const getAllItems = async (req, res) => {
  if (!Object.keys(req.query).length) {
    req.query.date = new Date();
  };
  const { birthYear, sex, lifestyle, height, weight } = req.user;
  const foodItemsData = await getAllFoodItems(req, res);
  const activitiesData = await getAllActivities(req, res);
  const showDate = formattedDateEdit(req.query.date);
  const estimatedCalories = calculateCalories(birthYear, sex, lifestyle, height, weight);
  const bio = reverseUserForm(req.user);
  req.session.data = { showDate, estimatedCalories, bio };
  req.user.data = req.session.data;

  res.render('main-window', { ...foodItemsData, ...activitiesData, showDate });
};

export { getAllItems };
