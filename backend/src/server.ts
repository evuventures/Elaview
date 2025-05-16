import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Initialize environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Elaview API!' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;