import express from 'express';
import cors from 'cors';
import { createApiRouter } from '../src/serverApp';

const app = express();

app.use(cors());
app.use(express.json());

// Support both /api prefix and direct route handling in Vercel
app.use('/api', createApiRouter());
app.use('/', createApiRouter());

export default app;
