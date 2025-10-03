import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8182;

// Serve static images
app.use('/images', express.static(path.join(__dirname, '../images')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'simple-image-server', port: PORT });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'Simple Image Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      images: '/images/*'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🖼️  Simple Image Server running on port ${PORT}`);
  console.log(`📁 Serving images from: ${path.join(__dirname, '../images')}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});
