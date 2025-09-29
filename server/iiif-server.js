const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// IIIF Image API endpoint
app.get('/iiif/2/:identifier/:region/:size/:rotation/:quality.:format', (req, res) => {
  const { identifier, region, size, rotation, quality, format } = req.params;
  
  // For now, just return a placeholder response
  // In a real implementation, this would process the image using Cantaloupe
  res.json({
    '@context': 'http://iiif.io/api/image/2/context.json',
    '@id': `http://localhost:${PORT}/iiif/2/${identifier}`,
    'protocol': 'http://iiif.io/api/image',
    'width': 2048,
    'height': 2048,
    'tiles': [
      {
        'width': 512,
        'height': 512,
        'scaleFactors': [1, 2, 4, 8]
      }
    ],
    'profile': [
      'http://iiif.io/api/image/2/level2.json',
      {
        'formats': ['jpg', 'png'],
        'qualities': ['native', 'color', 'gray', 'bitonal'],
        'supports': ['regionByPx', 'regionByPct', 'sizeByW', 'sizeByH', 'sizeByPct', 'sizeByConfinedWh', 'sizeByWh', 'rotationBy90s', 'mirroring']
      }
    ]
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'IIIF Server' });
});

app.listen(PORT, () => {
  console.log(`IIIF Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
