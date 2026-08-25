import express from "express";
import cors from "cors";
import appsRouter from "./routes/apps.js";

const app = express();
const port = process.env.PORT || 9091;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1/apps', appsRouter);

// Export for Vercel Serverless
export default app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}/`);
  });
}
