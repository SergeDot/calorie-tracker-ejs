import express from 'express';
const router = express.Router();
import {getSecretWord, changeSecretWord} from '../controllers/secretWord.js';

router.route('/').get(getSecretWord).post(changeSecretWord);

export default router;
