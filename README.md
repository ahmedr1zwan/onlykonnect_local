# OnlyKonnect

A web-based game inspired by the BBC's Only Connect quiz show. Play the connection game with custom puzzles, team scoring, and immersive audio.

## Features

- 🎮 **Two-Round Gameplay**: Connections (Round 1) and Sequences (Round 2)
- 🎨 **Custom Puzzle Creator**: Build your own puzzles with text, image, and audio hints
- 🔊 **Immersive Audio**: Background music and sound effects with volume controls
- 👥 **Team Scoring**: Track scores for two teams
- 💾 **Game State Persistence**: Resume games using localStorage
- ⏱️ **Customizable Timers**: Adjust guessing and steal times
- 🎯 **Hieroglyphic Tiles**: Beautiful visual tile selection system

## Tech Stack

- **React Router v7** - Full-stack React framework with SSR
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd onlykonnect_local
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Building for Production

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Gameplay

1. **Start a New Game**: Click "Start" on the home page
2. **Select Tiles**: Choose from 6 hieroglyphic tiles to reveal puzzles
3. **Round 1 - Connections**: Find the connection between 4 clues
4. **Round 2 - Sequences**: Identify the sequence pattern
5. **Score Points**: Correct answers earn points for your team
6. **Resume Games**: Your progress is automatically saved

## Game Creator

Access the Game Creator from the home page to:
- Create custom puzzles for all 6 tiles
- Add text, image, or audio hints
- Set team names
- Configure timer settings
- Save puzzles to localStorage

## Deployment

### Docker Deployment

The project includes a Dockerfile for containerized deployment:

```bash
# Build the Docker image
docker build -t onlykonnect .

# Run the container
docker run -p 3000:3000 onlykonnect
```

The containerized application can be deployed to:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway
- Render

### Platform-Specific Deployment

#### Vercel/Netlify

1. Connect your repository
2. Build command: `npm run build`
3. Output directory: `build/client`
4. Deploy!

#### Traditional Hosting

Deploy the output of `npm run build`:

```
├── package.json
├── package-lock.json
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

Make sure to run `npm run start` to serve the application.

## Project Structure

```
onlykonnect_local/
├── app/
│   ├── components/     # React components
│   ├── routes/         # Route handlers
│   ├── utils/          # Utility functions
│   └── app.css         # Global styles
├── public/
│   └── sounds/         # Audio files
├── Dockerfile          # Docker configuration
└── package.json        # Dependencies
```

## Browser Compatibility

- Modern browsers with ES6+ support
- localStorage required for game state persistence
- Audio API support for sound effects

## License

Private project - All rights reserved

---

Built with ❤️ using React Router.
