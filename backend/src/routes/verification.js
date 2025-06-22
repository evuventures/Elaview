// backend/routes/verification.js
import express from 'express';
import { verifyListing } from '../services/verificationService.js';

const router = express.Router();

router.post('/verify-listing', async (req, res) => {
  try {
    const { listingData, images } = req.body;
    const verificationResults = await verifyListing(listingData, images);
    
    res.json(verificationResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;