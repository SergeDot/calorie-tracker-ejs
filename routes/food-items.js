import express from 'express';
const router = express.Router();
import { getAllFoodItems, addFoodItem, showAddEditFoodItem, updateFoodItem, deleteFoodItem } from '../controllers/food-items.js';
import { getAllItems } from '../controllers/main-window.js';

router.route('/').get(getAllFoodItems).post(addFoodItem);
router.route('/new').get(showAddEditFoodItem);
router.route('/edit/:id').get(showAddEditFoodItem);
router.route('/update/:id').post(updateFoodItem);
router.route('/delete/:id').post(deleteFoodItem);


export default router;
