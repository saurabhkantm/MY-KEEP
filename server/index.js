import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import notesRoutes from './routes/notesRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'KeepAI REST API',
    version: '2.0.0'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ success: false, error: err.message || "Internal Server Error" });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 KeepAI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/api/health`);
});

export default app;
