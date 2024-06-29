import FoodItem from '../models/FoodItem.js';
import parseVErr from '../utils/parseValidationErrs.js';
import {processFoodItemForm, formattedDateEdit, reverseFoodItemForm} from '../utils/formProcessor.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

let updateToggle = true;
let showDate = formattedDateEdit(new Date());

const getAllFoodItems = async (req, res) => {
  let foodItems= await FoodItem.find({ createdBy: req.user._id }).sort('createdAt');
  showDate = formattedDateEdit(req.query.date);
  foodItems = foodItems.filter(item => formattedDateEdit(item.consumeDate) === showDate);
  reverseFoodItemForm(foodItems);
  const numberOfFoodItems = foodItems.length;
  if (!numberOfFoodItems) {
    req.flash('foodItemInfo', 'No food items for this day');
  } else {
    req.flash('foodItemInfo', `${numberOfFoodItems} ${numberOfFoodItems == 1 ? 'food item' : 'food items'} for this day`);
  };
  return { foodItems, foodItemInfo: req.flash('foodItemInfo') };
};

const showAddEditFoodItem = async (req, res, next) => {
  if (Object.keys(req.params).length) {
    updateToggle = true;
    try {
      const { user: { _id: userID }, params: { id: foodItemId } } = req;
      const foodItem = await FoodItem.findOne({ _id: foodItemId, createdBy: userID });
      if (!foodItem) {
        req.flash('error', `No Food Item with ID : ${foodItemId} at user ${userID}`);
        return res.redirect(`/main-window?date=${showDate}`);
      };
      return res.render('food-item', { foodItem, updateToggle, showDate });
    } catch (e) {
      return next(e);
    };
  };
  updateToggle = false;
  res.render('food-item', { foodItem: null, updateToggle, showDate });
};

const addFoodItem = async (req, res, next) => {
  updateToggle = false;
  req.body.createdBy = req.user._id;
  const formData = processFoodItemForm(req.body);
  try {
    const foodItem = await FoodItem.create(formData);
    req.flash('info', `${foodItem.name} added successfully`);
  } catch (e) {
    if (e.constructor.name === 'ValidationError') {
      parseVErr(e, req);
      return res.render('food-item', { foodItem: formData, errors: req.flash('error'), updateToggle, showDate });
    } else {
      console.log(e);
      return next(e);
    };
  };
  return res.redirect(`/main-window?date=${showDate}`);
};

const updateFoodItem = async (req, res, next) => {
  const { user: { _id: userID }, params: { id: foodItemId } } = req;
  const formData = processFoodItemForm(req.body);
  try {
    const foodItem = await FoodItem.findOneAndUpdate({ _id: foodItemId, createdBy: userID }, formData, {
      new: true,
      runValidators: true
    });
    if (!foodItem) {
      req.flash('error', `Error when updating a Food Item with ID : ${foodItemId} at user ${userID}`);
      throw new BadRequestError(`Error when updating a Food Item with ID : ${foodItemId} at user ${userID}`);
    };
    req.flash('info', `${foodItem.name} updated successfully`);
  } catch (e) {
    if (e.constructor.name === 'ValidationError') {
      parseVErr(e, req);
      const foodItem = await FoodItem.findOne({ _id: foodItemId, createdBy: userID });
      return res.render('food-item', { foodItem: { foodItem, ...formData }, errors: req.flash('error'), updateToggle, showDate });
    } else {
      console.log(e);
      return next(e);
    };
  };
  return res.redirect(`/main-window?date=${showDate}`);
};

// delete confirmation page, not implemented
const showDeleteConfirmation = async (req, res) => {
  const { user: { _id: userID }, params: { id: foodItemId } } = req;
  try {
    const foodItem = await FoodItem.findOne({ _id: foodItemId, createdBy: userID });
    if (!foodItem) {
      req.flash('error', `Error when deleting a Food Item with ID : ${foodItemId} at user ${userID}`);
      throw new NotFoundError(`Error when deleting a Food Item with ID : ${foodItemId} at user ${userID}`);
    };
    res.render('main-window', { foodItems: [foodItem] });
  } catch (e) {
    if (e.constructor.name === 'ValidationError') {
      parseVErr(e, req);
    };
    console.log(e);
  };
};

const deleteFoodItem = async (req, res) => {
  const { user: { _id: userID }, params: { id: foodItemId } } = req;
  try {
    const foodItem = await FoodItem.findOneAndDelete({ _id: foodItemId, createdBy: userID });
    if (!foodItem) {
      req.flash('error', `Error when deleting a Food Item with ID : ${foodItemId} at user ${userID}`);
      throw new BadRequestError(`Error when deleting a Food Item with ID : ${foodItemId} at user ${userID}`);
    };
    req.flash('info', `${foodItem.name} deleted successfully`);
  } catch (e) {
    console.log(e);
    return next(e);
  };
  return res.redirect(`/main-window?date=${showDate}`);
};

export { getAllFoodItems, addFoodItem, showAddEditFoodItem, updateFoodItem, deleteFoodItem };
