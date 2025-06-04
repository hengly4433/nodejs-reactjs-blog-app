import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan'; // for HTTP request logging (optional)
import dotenv from 'dotenv';

import logger from './config/logger';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import postRoutes from './routes/postRoutes';
import errorMiddleware from './middlewares/errorMiddleware';
import logMiddleware from './middlewares/logMiddleware';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import rateLimit from 'express-rate-limit';
import path from 'path';
import commentRoutes from './routes/commentRoutes';
import likeRoutes from './routes/likeRoutes';

dotenv.config();

// 1) Load and parse our OpenAPI YAML
const openapiDocument = YAML.load(path.join(__dirname, 'openapi.yaml'));



const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Validate critical env vars
if (!process.env.MONGO_URI) {
  logger.error('MONGO_URI is not set in .env');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is not set in .env');
  process.exit(1);
}

const app: Application = express();

app.use('/api/', apiLimiter);

// 2) Serve static files from the /uploads directory, so uploaded images are accessible
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, 'uploads')),
);

// 3) Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));



// Connect to MongoDB
connectDB();

// Middlewares
app.use(helmet()); // sets various HTTP headers for security
app.use(cors()); // enable CORS; you can configure origin as needed
app.use(express.json()); // parse JSON bodies
app.use(logMiddleware); // custom request logger
app.use(morgan('combined')); // optional: detailed request logs in combined format

// API Routes (prefixed with /api)
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);

app.use('/api', commentRoutes);   // handles /api/posts/:postId/comments and /api/comments/:id
app.use('/api', likeRoutes);      // handles /api/posts/:postId/like, /unlike, /likes

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Handle undefined routes
app.use((req: Request, res: Response, _next: NextFunction) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must come after all routes)
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
