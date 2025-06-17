import express from 'express';
const router = express.Router();

// Basic listing routes
router.get('/', (req, res) => {
  res.json({ message: 'Get all listings' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create listing' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get listing by ID' });
});

export default router; 