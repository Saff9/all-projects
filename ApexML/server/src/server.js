import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/index.js';
import securityMiddleware from './middleware/security.js';
import apiRoutes from './routes/api.js';

const app = express();
const port = config.port || 10000;

// --- Base Security Middleware ---
// 1. Set security-related HTTP headers
app.use(helmet());
// 2. Parse incoming JSON requests
app.use(express.json());
// 3. Enable CORS - only allows your frontend to make requests
app.use(cors({ origin: config.clientOriginUrl }));

app.set('trust proxy', 1);

// 4. Apply global rate limiting
app.use(securityMiddleware.limiter);

// --- API Routes ---
// All your API routes will be under /api/v1
app.use('/api/v1', apiRoutes);

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 ApexAI Server listening on port ${port}`);
  console.log(`Allowing requests from: ${config.clientOriginUrl}`);
});

app.get("/", (req, res) => {
  res.send("🔥 ApexAI server is running");
});

