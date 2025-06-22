// backend/routes/search.js
import express from 'express';
import { processAdvancedSearch } from '../services/aiService.js';
import { searchSpaces } from '../services/searchService.js';

const router = express.Router();

router.post('/ai-search', async (req, res) => {
  try {
    const { query, userLocation } = req.body;
    
    // Process with AI
    const searchParams = await processAdvancedSearch(query, userLocation);
    
    // Search with Algolia
    const results = await searchSpaces(searchParams);
    
    res.json({ searchParams, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;