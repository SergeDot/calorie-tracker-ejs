import FoodItem from "../models/FoodItem.js";
import { StatusCodes } from 'http-status-codes';
import { NotFoundError } from '../errors/index.js';

const getAllFoodItems = async (req, res) => {
  const foodItems = await FoodItem.find({ createdBy: req.user.userID }).sort('createdAt');
  res.status(StatusCodes.OK).json({ count: foodItems.length, foodItems });
};

const getFoodItem = async (req, res) => {
  const { user: { userID }, params: { id: foodItemId } } = req;
  const foodItem = await FoodItem.findOne({ _id: foodItemId, createdBy: userID });

  if (!foodItem) {
    throw new NotFoundError(`No Food Item with ID : ${foodItemId} at user ${userID}`);
  };
  res.status(StatusCodes.OK).json({ foodItem });
};

const createFoodItem = async (req, res) => {
  req.body.createdBy = req.user.userID;
  const foodItem = await FoodItem.create(req.body);
  res.status(StatusCodes.CREATED).json({ foodItem });
};

const updateFoodItem = async (req, res) => {
  const { user: { userID }, params: { id: foodItemId } } = req;
  const foodItem = await FoodItem.findOneAndUpdate({ _id: foodItemId, createdBy: userID }, req.body, {
    new: true,
    runValidators: true
  });
  if (!foodItem) {
    throw new NotFoundError(`No Food Item with ID : ${foodItemId} at user ${userID}`);
  };
  res.status(StatusCodes.OK).json({ foodItem });
};

const deleteFoodItem = async (req, res) => {
  const { user: { userID }, params: { id: foodItemId } } = req;
  const foodItem = await FoodItem.findOneAndDelete({ _id: foodItemId, createdBy: userID });
  if (!foodItem) {
    throw new NotFoundError(`No foodItem with ID : ${foodItemId} at user ${userID}`);
  };
  res.status(StatusCodes.OK).json({ msg: `Food Item ${foodItemId} deleted successfully` });
};

export { getAllFoodItems, getFoodItem, createFoodItem, updateFoodItem, deleteFoodItem };
