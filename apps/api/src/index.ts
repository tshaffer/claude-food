import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './db.js';
import usersRouter from './routes/users.js';
import foodsRouter from './routes/foods.js';
import templatesRouter from './routes/templates.js';
import logEntriesRouter from './routes/logEntries.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');

const app = express();
const PORT = process.env.PORT ?? 3001;
const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/claude-food';

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/foods', foodsRouter);
app.use('/api', templatesRouter);
app.use('/api', logEntriesRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

connectDb(MONGODB_URI).then(() => {
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
});
