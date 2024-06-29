import express from 'express';
const router = express.Router();
import { getUser, updateUser } from '../controllers/user.js';

router.route('/').get(getUser).post(updateUser);


export default router;
