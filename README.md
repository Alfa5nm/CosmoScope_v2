# Cosmoscope - NASA Space Apps 2025

**Ambiguity Rise / Embiggen Your Eyes — Cosmoscope**

A browser game that turns exploration of ultra-high-res NASA imagery into a minimalist, story-driven experience. Play as a time-traveling astronaut investigating mysterious signals from Earth, exploring the solar system, and discovering hidden secrets across time and space.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

#### Quick Start (Recommended)
```bash
# Windows
install.bat

# Linux/Mac
chmod +x install.sh
./install.sh
```

#### Manual Installation
1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd cosmoscope
   npm run install:all
   ```

2. **Configure NASA API:**
   ```bash
   cp server/config.sample.json server/config.json
   # Edit server/config.json and set your NASA_API_KEY
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Client: http://localhost:5173
   - Server: http://localhost:5174

#### Troubleshooting
If you encounter build issues (especially on Windows), see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions.

### Production Build

```bash
npm run build
npm start
```

## 🎮 Game Features

### Core Gameplay
- **Solar System Exploration**: Navigate through a 3D solar system with Earth, Moon, and Mars
- **Time Travel**: Use the timeline to explore different dates and see how planets change
- **Deep Zoom**: Seamlessly transition from 3D to 2D map view for detailed exploration
- **Mission System**: Follow the main quest as a time-traveling astronaut
- **Labeling System**: Create and share annotations on planetary surfaces
- **Apollo Sites**: Visit historic Apollo landing sites on the Moon

### Story Mode
- **Main Quest**: Investigate mysterious signals from Earth in 2023
- **Side Quests**: Discover craters, explore Mars, and find anomalies
- **Progressive Unlocking**: Complete missions to unlock new areas and features

### Technical Features
- **Real NASA Data**: Uses NASA GIBS, APOD, and Mars rover APIs
- **Responsive Design**: Works on desktop and mobile devices
- **Accessibility**: High contrast mode, reduced motion, keyboard navigation
- **Audio System**: Ambient space sounds and interactive audio feedback
- **Offline Support**: Local storage fallback when server is unavailable

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Three.js** for 3D solar system visualization
- **MapLibre GL** for 2D deep-zoom maps
- **Framer Motion** for smooth animations
- **Styled Components** for theming

### Backend
- **Node.js** with Express
- **SQLite** with better-sqlite3 for data persistence
- **NASA API** integration for real space data
- **CORS** and security middleware

### Data Sources
- **NASA GIBS** for Earth imagery tiles
- **NASA APOD** for daily space images
- **Mars Rover APIs** for Mars exploration data
- **LROC** for Moon imagery
- **MRO CTX** for Mars surface data

## 📁 Project Structure

```
cosmoscope/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and Three.js scenes
│   │   └── assets/        # Audio and image assets
│   └── public/            # Static assets
├── server/                 # Express backend
│   ├── routes/            # API route handlers
│   └── config.sample.json # Configuration template
└── README.md              # This file
```

## 🎯 Mission System

### Main Quest: "The Time Traveler's Journey"
1. **Launch Sequence**: Start by exploring the solar system
2. **Earth Observation**: Observe Earth from space and identify key locations
3. **The Apollo Trail**: Travel to the Moon and visit the Apollo 11 landing site

### Side Quests
- **Crater Explorer**: Discover and label interesting craters on the Moon
- **Mars Reconnaissance**: Explore the red planet and its unique features
- **Temporal Anomaly**: Investigate strange temporal readings from Earth in 2023

## 🗺️ Data Sources & Attribution

### Earth Imagery
- **Blue Marble**: NASA Earth Observatory
- **Night Lights**: VIIRS City Lights 2012
- **Thermal**: MODIS Land Surface Temperature
- **Elevation**: SRTM Digital Elevation Model

### Moon Imagery
- **LROC WAC**: Lunar Reconnaissance Orbiter Camera
- **LOLA Elevation**: Lunar Orbiter Laser Altimeter

### Mars Imagery
- **MRO CTX**: Mars Reconnaissance Orbiter Context Camera
- **MOLA Elevation**: Mars Global Surveyor Laser Altimeter

### Apollo Landing Sites
- Apollo 11: Sea of Tranquility (0.6741°N, 23.4730°E)
- Apollo 12: Ocean of Storms (-3.0126°N, -23.4216°E)
- Apollo 14: Fra Mauro (-3.6453°N, -17.4714°E)
- Apollo 15: Hadley-Apennine (26.1322°N, 3.6339°E)
- Apollo 16: Descartes Highlands (-8.9730°N, 15.5002°E)
- Apollo 17: Taurus-Littrow (20.1908°N, 30.7717°E)

## 🎨 Design System

### Theme
- **Colors**: Deep navy background (#000011), neon cyan accents (#00ffff)
- **Typography**: Courier New monospace font for retro-futuristic feel
- **Effects**: Soft glows, subtle animations, and smooth transitions
- **Accessibility**: High contrast mode and reduced motion support

### UI Components
- **HUD Elements**: Objective display, points counter, timeline
- **Navigation**: Right drawer for destinations and modes
- **Planet HUD**: Floating cards with planetary information
- **Labels Panel**: Create and manage annotations
- **Timeline**: Date selection with slider and quick access

## 🔧 Configuration

### Environment Variables
```bash
NASA_API_KEY=your_nasa_api_key_here
PORT=5174
ALLOWED_ORIGINS=http://localhost:5173
DATABASE_PATH=./db.sqlite
```

### NASA API Key
1. Get your free API key from [NASA API Portal](https://api.nasa.gov/)
2. Set it in `server/config.json` or as an environment variable
3. The key is used server-side only for security

## 🚀 Deployment

### Development
```bash
npm run dev          # Start both client and server
npm run dev:client   # Start only client (port 5173)
npm run dev:server   # Start only server (port 5174)
```

### Production
```bash
npm run build        # Build both client and server
npm start           # Start production server
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5174
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## 📊 Performance

### Optimizations
- **Lazy Loading**: Three.js and heavy assets loaded on demand
- **Tile Caching**: Map tiles cached for better performance
- **Asset Optimization**: Compressed audio and images
- **Code Splitting**: React components loaded as needed

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL**: Required for 3D visualization
- **ES2020**: Modern JavaScript features

## 🎵 Audio System

### Sound Effects
- **Ambient**: Space atmosphere loop
- **Click**: Button and interaction sounds
- **Hover**: UI element hover feedback

### Accessibility
- **Audio Toggle**: Users can disable audio
- **Respects Preferences**: Honors `prefers-reduced-motion`
- **Keyboard Navigation**: Full keyboard support

## 🔒 Security

### Data Protection
- **No API Keys in Client**: All NASA API calls go through server
- **CORS Configuration**: Restricted to allowed origins
- **Input Validation**: All user inputs sanitized
- **SQL Injection Prevention**: Parameterized queries

### Privacy
- **Guest Accounts**: No personal information required
- **Local Storage**: User data stored locally when possible
- **Optional Backend**: Works offline with local storage

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Clear commit messages

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for providing incredible space data and imagery
- **MapLibre GL** for open-source mapping technology
- **Three.js** for 3D web graphics
- **React** and **Vite** for modern web development
- **NASA Space Apps Challenge** for inspiring this project

## 📞 Contact

- **Project**: NASA Space Apps 2025 - Cosmoscope
- **Team**: [Your Team Name]
- **Email**: [your-email@example.com]
- **GitHub**: [your-github-username]

---

**Built with ❤️ for NASA Space Apps Challenge 2025**

*"The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself."* - Carl Sagan