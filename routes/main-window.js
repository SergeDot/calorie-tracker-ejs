import express from 'express';
const router = express.Router();
import { getAllItems } from '../controllers/main-window.js';

router.route('/').get(getAllItems);


export default router;
