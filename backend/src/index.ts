import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Elaview API!" });
});

// Instead of listening on a port, export the handler for Vercel
export default function handler(req: Request, res: Response) {
  return app(req, res);
}