# Radius Impact

A strategic grid-based number game where every move counts! Reveal numbers, combine values within radius, and aim for the highest score.

## Game Rules

### Basic Mechanics
1. Click any cell to reveal a random value (-23 to 20)
2. Each revealed number affects cells within a 15-unit radius
3. Score calculation for each move:
   - New cell value + (Sum of values in radius × |New value|)
   - Example: If you reveal a 3 and there's a total of 5 in radius
   - Score added = 3 + (5 × |3|) = 18

### Special Cells
You may encounter special cells that change the game:
- **X**: Game Over - Ends the game immediately, score becomes 0
- **I**: Invert Score - Multiplies your current score by -1
- **Z**: Zero Score - Resets your score to 0
- **F**: Finish Game - Ends the game, keeping your current score

### Navigation
- **Drag** the grid to explore
- Use the 🧭 navigator to jump to specific coordinates
- Coordinates are shown in x:y format
- Valid range: -10000 to 10000

### Strategy Tips
1. Look for high positive numbers to multiply radius values
2. Be cautious with negative numbers - they can reduce your score
3. Special cells appear randomly - they can help or hurt your strategy
4. Plan your moves to maximize the radius effect

## For Developers

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/radius-impact.git

# Navigate to project directory
cd radius-impact

# Install dependencies
npm install
```

### Running the Game
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Tech Stack
- React
- Remix
- TypeScript
- Tailwind CSS
- Framer Motion

### Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
