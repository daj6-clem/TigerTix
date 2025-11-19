import express from 'express';
import {parseInput} from '../controllers/llmController.js';

const router = express.Router();

router.post('/parse', parseInput);

export default router;