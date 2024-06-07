import express from 'express';
const router = express.Router();
import { getAllFoodItems, addFoodItem, showAddEditFoodItem, updateFoodItem, deleteFoodItem } from '../controllers/food-items.js';

// router.route('/').post(createFoodItem).get(getAllFoodItems);
// router.route('/:id').get(getFoodItem).delete(deleteFoodItem).patch(updateFoodItem);

router.route('/').get(getAllFoodItems).post(addFoodItem);
router.route('/new').get(showAddEditFoodItem);
router.route('/edit/:id').get(showAddEditFoodItem);
router.route('/update/:id').post(updateFoodItem);
router.route('/delete/:id').post(deleteFoodItem);


export default router;
