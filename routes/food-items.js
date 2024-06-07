import express from 'express';
const router = express.Router();
import { getAllFoodItems, getFoodItem, createFoodItem, updateFoodItem, deleteFoodItem } from '../controllers/food-items.js';

router.route('/').post(createFoodItem).get(getAllFoodItems);
router.route('/:id').get(getFoodItem).delete(deleteFoodItem).patch(updateFoodItem);

export default router;
