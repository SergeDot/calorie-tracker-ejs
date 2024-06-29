import express from 'express';
const router = express.Router();
import { getAllActivities, addActivity, showAddEditActivity, updateActivity, deleteActivity } from '../controllers/activities.js';

router.route('/').get(getAllActivities).post(addActivity);
router.route('/new').get(showAddEditActivity);
router.route('/edit/:id').get(showAddEditActivity);
router.route('/update/:id').post(updateActivity);
router.route('/delete/:id').post(deleteActivity);


export default router;
