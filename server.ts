import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { apiRouter } from './src/server/api';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Mount API router
app.use('/api', apiRouter);

// Serve static files in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Handle /admin.php and SPA routing
app.get('/admin.php', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Foodgo Server running on port ${PORT}`);
});
