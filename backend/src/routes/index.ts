// src/routes/index.ts
import express from 'express';
import { getExampleData, createExampleData } from '../controllers/exampleController.js';

const router = express.Router();

// Example routes
router.get('/examples', getExampleData);
router.post('/examples', createExampleData);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

export default router;