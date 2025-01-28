export const en = {
  meta: {
    title: "0:0",
    description: "Limited canvas (-10000 to 10000)"
  },
  game: {
    score: "Your Score",
    finalScore: "Final Score",
    noCalculations: "No calculations yet",
    startGame: "Start game to see round result",
    playAgain: "Play Again",
    playWithBot: "Play with Bot",
    stopAutoPlay: "Stop Auto-play",
    startAutoPlay: "Start Auto-play",
    openNavigator: "Open Navigator",
    closeNavigator: "Close Navigator",
    go: "Go",
    share: "Share Your Score",
    copy: "Copy Link",
    gameOver: "Game Over"
  },
  rules: {
    title: "Game Rules",
    changeLanguage: "Change Language",
    close: "Close",
    basicMechanics: {
      title: "Basic Mechanics",
      items: [
        "Click any cell to reveal a random value (-23 to 20)",
        "Each revealed number affects cells within a 15-unit radius",
        "Score calculation: New value + (Sum of values in radius × |New value|)"
      ]
    },
    specialCells: {
      title: "Special Cells",
      items: [
        { key: "X", desc: "Game Over - Ends game immediately, score becomes 0" },
        { key: "I", desc: "Invert Score - Multiplies your current score by -1" },
        { key: "Z", desc: "Zero Score - Resets your score to 0" },
        { key: "F", desc: "Finish Game - Ends the game, keeping your current score" }
      ]
    },
    navigation: {
      title: "Navigation",
      items: [
        "Drag the grid to explore",
        "Use the 🧭 navigator to jump to specific coordinates",
        "Valid coordinate range: -10000 to 10000"
      ]
    },
    strategy: {
      title: "Strategy Tips",
      items: [
        "Look for high positive numbers to multiply radius values",
        "Be cautious with negative numbers - they can reduce your score",
        "Special cells appear randomly - they can help or hurt your strategy",
        "Plan your moves to maximize the radius effect"
      ]
    }
  },
  calculation: {
    newValue: "New Value",
    radiusSum: "Radius Sum",
    multiplier: "Multiplier",
    totalAdded: "Total Added",
    specialEffects: {
      "Game Over!": "Game Over - Score reset to 0",
      "Score Inverted!": "Score Inverted",
      "Score Zeroed!": "Score Reset to 0",
      "Game Finished!": "Game Finished",
      "Decorative Cell!": "Decorative Cell"
    }
  }
}; 