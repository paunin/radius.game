import { useState, useRef, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";

export const meta: MetaFunction = () => {
  return [
    { title: "0:0" },
    { name: "description", content: "Limited canvas (-10000 to 10000)" },
  ];
};

const colors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500',
  'bg-orange-500', 'bg-teal-500', 'bg-lime-500', 'bg-fuchsia-500'
];

const CELL_SIZE = 32; // pixels
const MIN_COORD = -10000;
const MAX_COORD = 10000;
const HIGHLIGHT_RADIUS = 15;

// Update LOGO_COLORS with darker but colorful colors
const LOGO_COLORS = [
  ["#c1121f", "#780000"],  // Deep red
  ["#780000", "#9b2226"],  // Dark red to burgundy
  ["#9b2226", "#7209b7"],  // Burgundy to deep purple
  ["#7209b7", "#480ca8"],  // Deep purple shades
  ["#480ca8", "#3f37c9"],  // Purple to indigo
  ["#3f37c9", "#4361ee"],  // Indigo to blue
  ["#4361ee", "#4895ef"],  // Blue shades
  ["#4895ef", "#0077b6"],  // Blue to deep blue
  ["#0077b6", "#023e8a"],  // Deep blue
  ["#023e8a", "#03045e"],  // Navy blue
  ["#03045e", "#073b4c"],  // Navy to teal
  ["#073b4c", "#0a9396"],  // Deep teal
  ["#0a9396", "#006466"],  // Teal shades
  ["#006466", "#004b23"],  // Teal to forest green
  ["#004b23", "#386641"],  // Forest green
  ["#386641", "#7b2cbf"],  // Green to purple
  ["#7b2cbf", "#9d0208"],  // Purple to red
  ["#9d0208", "#6a040f"],  // Red shades
  ["#6a040f", "#370617"],  // Deep red
  ["#370617", "#c1121f"],  // Back to starting red
];

// Update cell value constants
const MIN_CELL_VALUE = -23;
const MAX_CELL_VALUE = 20;

// Add animation timings
const ANIMATIONS = {
  BURN_DELAY_MAX: 1000,    // Maximum random delay for cell burning
  BURN_DURATION_MIN: 1000, // Minimum burn duration
  BURN_DURATION_MAX: 2000, // Maximum burn duration
  TARGET_FADE_DURATION: 5000, // Duration for target highlight fade
  BLINK_DURATION: 1000     // Duration for calculation blink effect
};

// Add burn effect colors
const BURN_COLORS = [
  'bg-yellow-500',  // Start yellow
  'bg-orange-500',  // Then orange
  'bg-red-600',     // Then red
  'bg-gray-900'     // End black
];

// Add grayscale colors for F cell finish effect
const FINISH_COLORS = [
  'bg-white',         // Start white
  'bg-gray-300',      // Light gray
  'bg-gray-600',      // Medium gray
  'bg-black'          // End black
];

// Update special cell configuration
const SPECIAL_CELLS = {
  X: { chance: 1/50, label: 'Game Over' },     // Changed from 1/25
  I: { chance: 1/20, label: 'Invert Score' },  // Changed from 1/10
  Z: { label: 'Zero Score', chance: 1/30 },    // Changed from 1/15
  F: { chance: 1/40, label: 'Finish Game' }    // Changed from 1/20
} as const;

type SpecialCell = keyof typeof SPECIAL_CELLS;
type CellValue = number | SpecialCell | string;

// Update LastCalculation type to include special events
type LastCalculation = {
  newValue: CellValue;
  radiusSum: number;
  multiplier: number;
  total: number;
  specialEffect?: string;
} | null;

// Add helper to determine if a value is a special cell
const isSpecialCell = (value: CellValue): value is SpecialCell => 
  typeof value === 'string' && value in SPECIAL_CELLS;

// Add helper function to get numeric value safely
const getNumericValue = (value: CellValue): number | null => {
  if (typeof value === 'number') return value;
  if (EMOJI_CELLS.options.includes(value as string)) return 0;
  return null;
};

// Keep types and constants outside the component
type BurningCell = {
  startTime: number;
  duration: number;
};

// Add emoji constants near other constants
const EMOJI_CELLS = {
  chance: 1/15, // 1 in 15 chance
  options: [
    '🌟', '🌈', '🎈', '🎨', '🎭', '🎪', 
    '🎯', '🎲', '🎮', '🎸', '🎹', '🌺',
    '🌸', '🍀', '🌴', '🌙', '✨', '🎠',
    '🎪', '🎭', '🎨', '🎪', '🎯', '🎲'
  ]
};

export default function Index() {
  // Add at the beginning of the component, with other helper functions
  const getValueFontSize = (value: number) => {
    const numDigits = Math.abs(value).toString().length + (value < 0 ? 1 : 0);
    if (numDigits <= 1) return 'text-xl';
    if (numDigits === 2) return 'text-lg';
    return 'text-base';
  };

  // Move all state declarations here
  const [pixels, setPixels] = useState<Map<string, string>>(new Map());
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [hoveredCoords, setHoveredCoords] = useState<{ x: number, y: number } | null>(null);
  const [targetCoords, setTargetCoords] = useState<{ x: number, y: number } | null>(null);
  const [coordInput, setCoordInput] = useState("");
  const [viewportSize, setViewportSize] = useState({ width: 31, height: 31 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  const [inputError, setInputError] = useState<string | null>(null);
  const [isGridHovered, setIsGridHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [targetTimestamp, setTargetTimestamp] = useState<number | null>(null);
  const [cellValues, setCellValues] = useState<Map<string, CellValue>>(new Map());
  const [score, setScore] = useState(0);
  const [blinkingCells, setBlinkingCells] = useState<Set<string>>(new Set());
  const [blinkTimestamp, setBlinkTimestamp] = useState<number | null>(null);
  const [lastCalculation, setLastCalculation] = useState<LastCalculation>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  const [gameOver, setGameOver] = useState<{ score: number, reason: string } | null>(null);
  const [burningCells, setBurningCells] = useState<Map<string, BurningCell>>(new Map());
  const [isBurning, setIsBurning] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Add ref for timeout
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout>();

  // Add new state for rules popup
  const [showRules, setShowRules] = useState(false);

  // Move helper functions inside component
  const getShareText = (score: number) => `I scored ${score} points in Radius Game!`;

  const getShareUrls = (score: number) => {
    const text = getShareText(score);
    const url = window.location.href;
    
    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      wechat: `weixin://dl/moments?text=${encodeURIComponent(`${text} ${url}`)}`,
    };
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Move burning effect inside component
  useEffect(() => {
    if (!isBurning) return;
    
    // Initialize burning for visible cells with random delays and durations
    const visibleCells = new Map<string, BurningCell>();
    getVisibleGrid().forEach(row => {
      row.forEach(cell => {
        const coords = `${cell.x}:${cell.y}`;
        if (!cell.isOutOfBounds) {
          visibleCells.set(coords, {
            startTime: Date.now() + Math.random() * ANIMATIONS.BURN_DELAY_MAX,
            duration: ANIMATIONS.BURN_DURATION_MIN + Math.random() * 
              (ANIMATIONS.BURN_DURATION_MAX - ANIMATIONS.BURN_DURATION_MIN)
          });
        }
      });
    });
    setBurningCells(visibleCells);
    
    const animate = () => {
      if (!isBurning) return;
      
      setBurningCells(prev => {
        const current = new Map(prev);
        let hasActiveCells = false;
        
        current.forEach((cell, coords) => {
          const elapsed = Date.now() - cell.startTime;
          if (elapsed >= cell.duration) {
            // Remove the cell value and color when burning completes
            setCellValues(prev => {
              const next = new Map(prev);
              next.delete(coords);
              return next;
            });
            setPixels(prev => {
              const next = new Map(prev);
              next.delete(coords);
              return next;
            });
            current.delete(coords);
          } else {
            hasActiveCells = true;
          }
        });
        
        if (!hasActiveCells && current.size === 0) {
          setIsBurning(false);
        }
        
        return current;
      });
      
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [isBurning]);

  // Update getBurnColor helper to use different colors for F cell
  const getBurnColor = (coords: string, baseColor: string) => {
    if (!isBurning || !burningCells.has(coords)) return baseColor;
    
    const cell = burningCells.get(coords)!;
    const elapsed = Date.now() - cell.startTime;
    const progress = Math.min(1, elapsed / cell.duration);
    
    // Use FINISH_COLORS if game is finished, otherwise use BURN_COLORS
    const colors = gameOver?.reason === 'Game Finished!' ? FINISH_COLORS : BURN_COLORS;
    const index = Math.floor(progress * (colors.length - 1));
    return colors[index];
  };

  // Update restartGame function to clear auto-play state
  const restartGame = () => {
    setScore(0);
    setCellValues(new Map());
    setPixels(new Map());
    setSelectedColor(null);
    setGameOver(null);
    setIsAutoPlaying(false);
  };

  // Update viewport size on window resize
  useEffect(() => {
    const updateSize = () => {
      const width = Math.ceil(window.innerWidth / CELL_SIZE);
      const height = Math.ceil(window.innerHeight / CELL_SIZE);
      setViewportSize({ 
        width: width % 2 === 0 ? width + 1 : width,
        height: height % 2 === 0 ? height + 1 : height
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update handleCoordSubmit to fix target highlighting
  const handleCoordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    const match = coordInput.match(/^(-?\d+):(-?\d+)$/);
    
    if (match) {
      const x = parseInt(match[1]);
      const y = parseInt(match[2]);
      
      if (x < MIN_COORD || x > MAX_COORD || y < MIN_COORD || y > MAX_COORD) {
        setInputError(`Coordinates must be between ${MIN_COORD} and ${MAX_COORD}`);
        return;
      }

      // Set target coords with negated y to match display coordinates
      setTargetCoords({ x, y: -y });
      setViewportOffset({ x: -x, y: y });
      setTargetTimestamp(Date.now());
    }
  };

  // Add this helper to get a random color (move existing color selection logic here)
  const getRandomColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Update calculateNewScore to skip emoji cells
  const calculateNewScore = (x: number, y: number, value: number) => {
    let radiusSum = 0;
    const involvedCells = new Set<string>();
    const newCellCoords = `${x}:${y}`;
    
    // Sum up all values within radius (excluding the new cell)
    for (const [coords, cellValue] of cellValues.entries()) {
      // Skip the newly revealed cell and emoji cells
      if (coords === newCellCoords || EMOJI_CELLS.options.includes(cellValue as string)) continue;
      
      const [cellX, cellY] = coords.split(':').map(Number);
      const distance = calculateDistance(x, y, cellX, cellY);
      
      if (distance <= HIGHLIGHT_RADIUS) {
        // Only add numeric values to sum
        const numericValue = getNumericValue(cellValue);
        if (numericValue !== null) {
          radiusSum += numericValue;
          involvedCells.add(coords);
        }
      }
    }
    
    // Set blinking cells and start animation
    setBlinkingCells(involvedCells);
    setBlinkTimestamp(Date.now());
    
    // Store calculation details
    setLastCalculation({
      newValue: value,
      radiusSum: radiusSum,
      multiplier: Math.abs(value),
      total: value + (radiusSum * Math.abs(value))
    });
    
    return value + (radiusSum * Math.abs(value));
  };

  // Add effect for clearing blink state
  useEffect(() => {
    if (!blinkTimestamp) return;
    
    const timer = setTimeout(() => {
      setBlinkingCells(new Set());
      setBlinkTimestamp(null);
    }, 1000); // Blink for 1 second
    
    return () => clearTimeout(timer);
  }, [blinkTimestamp]);

  // Update handlePixelClick probability handling
  const handlePixelClick = (x: number, y: number) => {
    if (gameOver) return;
    
    if (x >= MIN_COORD && x <= MAX_COORD && 
        y >= MIN_COORD && y <= MAX_COORD && 
        !cellValues.has(`${x}:${y}`)) {
      const coords = `${x}:${y}`;
      
      let value: CellValue;
      const rand = Math.random();
      let specialEffect: string | undefined;
      let cumChance = 0;

      // First check for emoji with its own random roll
      if (Math.random() < EMOJI_CELLS.chance) {
        // Emoji cell
        value = EMOJI_CELLS.options[Math.floor(Math.random() * EMOJI_CELLS.options.length)];
        
        const color = selectedColor || getRandomColor();
        if (!selectedColor) {
          setSelectedColor(color);
        }

        setCellValues(new Map(cellValues.set(coords, value)));
        setPixels(new Map(pixels.set(coords, color)));

        setLastCalculation({
          newValue: value,
          radiusSum: 0,
          multiplier: 0,
          total: 0,
          specialEffect: "Decorative Cell"
        });
        
        return;
      }

      // Handle special cells with original probabilities
      if (rand < (cumChance += SPECIAL_CELLS.X.chance)) {
        value = 'X';
        specialEffect = 'Game Over!';
        setGameOver({ score: 0, reason: 'Game Over!' });
        setScore(0);
        setIsAutoPlaying(false);
        
        // Clear all values immediately
        const visibleCells = new Set<string>();
        getVisibleGrid().forEach(row => {
          row.forEach(cell => {
            if (!cell.isOutOfBounds) {
              visibleCells.add(`${cell.x}:${cell.y}`);
            }
          });
        });
        
        // Clear values and start burning
        setCellValues(new Map());
        setIsBurning(true);
        
        // Initialize burning for all visible cells
        const burningCellsMap = new Map<string, BurningCell>();
        visibleCells.forEach(coords => {
          burningCellsMap.set(coords, {
            startTime: Date.now() + Math.random() * ANIMATIONS.BURN_DELAY_MAX,
            duration: ANIMATIONS.BURN_DURATION_MIN + Math.random() * 
              (ANIMATIONS.BURN_DURATION_MAX - ANIMATIONS.BURN_DURATION_MIN)
          });
        });
        setBurningCells(burningCellsMap);
      } else if (rand < (cumChance += SPECIAL_CELLS.F.chance)) {
        value = 'F';
        specialEffect = 'Game Finished!';
        setGameOver({ score, reason: 'Game Finished!' });
        setIsAutoPlaying(false);
        
        // Clear all values immediately
        const visibleCells = new Set<string>();
        getVisibleGrid().forEach(row => {
          row.forEach(cell => {
            if (!cell.isOutOfBounds) {
              visibleCells.add(`${cell.x}:${cell.y}`);
            }
          });
        });
        
        // Clear values and start burning with checker colors
        setCellValues(new Map());
        setIsBurning(true);
        
        // Initialize burning for all visible cells
        const burningCellsMap = new Map<string, BurningCell>();
        visibleCells.forEach(coords => {
          burningCellsMap.set(coords, {
            startTime: Date.now() + Math.random() * ANIMATIONS.BURN_DELAY_MAX,
            duration: ANIMATIONS.BURN_DURATION_MIN + Math.random() * 
              (ANIMATIONS.BURN_DURATION_MAX - ANIMATIONS.BURN_DURATION_MIN)
          });
        });
        setBurningCells(burningCellsMap);
      } else if (rand < (cumChance += SPECIAL_CELLS.I.chance)) {
        value = 'I';
        specialEffect = 'Score Inverted!';
        setScore(prev => -prev);
      } else if (rand < (cumChance += SPECIAL_CELLS.Z.chance)) {
        value = 'Z';
        specialEffect = 'Score Zeroed!';
        setScore(0);
      } else {
        value = Math.floor(Math.random() * (MAX_CELL_VALUE - MIN_CELL_VALUE + 1)) + MIN_CELL_VALUE;
      }

      const color = selectedColor || getRandomColor();
      if (!selectedColor) {
        setSelectedColor(color);
      }

      setCellValues(new Map(cellValues.set(coords, value)));
      setPixels(new Map(pixels.set(coords, color)));

      if (typeof value === 'number') {
        const scoreChange = calculateNewScore(x, y, value);
        setScore(prev => prev + scoreChange);
      }

      // Update last calculation with special effect if any
      setLastCalculation({
        newValue: value,
        radiusSum: isSpecialCell(value) ? 0 : calculateRadiusSum(x, y),
        multiplier: isSpecialCell(value) ? 0 : Math.abs(value as number),
        total: isSpecialCell(value) ? 0 : calculateNewScore(x, y, value as number),
        specialEffect
      });
    }
  };

  // Update title with coordinates
  useEffect(() => {
    if (hoveredCoords) {
      document.title = `${hoveredCoords.x}:${-hoveredCoords.y}`;
    } else {
      document.title = "0:0";
    }
  }, [hoveredCoords]);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialOffset(viewportOffset);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = Math.round((e.clientX - dragStart.x) / CELL_SIZE);
      const deltaY = Math.round((e.clientY - dragStart.y) / CELL_SIZE);
      
      const halfWidth = Math.floor(viewportSize.width / 2);
      const halfHeight = Math.floor(viewportSize.height / 2);

      const maxX = MAX_COORD - halfWidth;
      const minX = MIN_COORD + halfWidth;
      const maxY = MAX_COORD - halfHeight;
      const minY = MIN_COORD + halfHeight;

      const newX = initialOffset.x + deltaX;
      const newY = initialOffset.y + deltaY;

      // Clamp values to prevent going out of bounds
      const clampedX = Math.min(maxX, Math.max(minX, newX));
      const clampedY = Math.min(maxY, Math.max(minY, newY));

      // Only update if within bounds
      if (clampedX >= minX && clampedX <= maxX && clampedY >= minY && clampedY <= maxY) {
        setViewportOffset({ x: clampedX, y: clampedY });
      }
    } else {
      // Original hover coordinate handling
      const cell = e.target as HTMLElement;
      const coords = cell.getAttribute('data-coords');
      if (coords) {
        const [x, y] = coords.split(':').map(Number);
        setHoveredCoords({ x, y });
      }
    }
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add mouse up event listener to window
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Update the getVisibleGrid function to fix Y coordinate handling
  const getVisibleGrid = () => {
    const grid = [];
    const halfWidth = Math.floor(viewportSize.width / 2);
    const halfHeight = Math.floor(viewportSize.height / 2);
    
    for (let y = -halfHeight; y <= halfHeight; y++) {
      const row = [];
      for (let x = -halfWidth; x <= halfWidth; x++) {
        const worldX = x - viewportOffset.x;
        // Fix: Keep Y coordinate system consistent
        const worldY = y - viewportOffset.y;
        
        const isOutOfBounds = 
          worldX < MIN_COORD || 
          worldX > MAX_COORD || 
          worldY < MIN_COORD || 
          worldY > MAX_COORD;

        const isTarget = targetCoords && 
          worldX === targetCoords.x && 
          worldY === targetCoords.y;

        const coords = `${worldX}:${worldY}`;
        const color = isOutOfBounds ? 'bg-gray-300' : (pixels.get(coords) || 'bg-white');
        row.push({ 
          x: worldX, 
          y: worldY, 
          color,
          isOutOfBounds,
          isTarget
        });
      }
      grid.push(row);
    }
    return grid;
  };

  // Add this helper function at the top level
  const getTooltipPosition = (cell: { x: number, y: number }, viewportSize: { width: number, height: number }) => {
    const isNearRightEdge = cell.x > viewportSize.width / 2;
    const isNearTopEdge = cell.y < -viewportSize.height / 2;
    
    let positionClasses = "transform ";
    
    // Horizontal positioning
    if (isNearRightEdge) {
      positionClasses += "right-0 translate-x-0 mr-2 ";
    } else {
      positionClasses += "left-1/2 -translate-x-1/2 ";
    }
    
    // Vertical positioning
    if (isNearTopEdge) {
      positionClasses += "top-full mt-2";
    } else {
      positionClasses += "bottom-full mb-2";
    }
    
    return positionClasses;
  };

  // Add this helper function to calculate distance between cells
  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Add handlers for grid container
  const handleGridMouseEnter = () => {
    setIsGridHovered(true);
  };

  const handleGridMouseLeave = () => {
    setIsGridHovered(false);
    setHoveredCoords(null);
  };

  // Update helper function to calculate target opacity with 5-second fade
  const getTargetOpacity = () => {
    if (!targetTimestamp) return 0;
    const elapsed = (Date.now() - targetTimestamp) / 1000; // convert to seconds
    if (elapsed > 5) {
      setTargetCoords(null);
      setTargetTimestamp(null);
      return 0;
    }
    // Use exponential decay for faster initial fade
    return 0.8 * Math.exp(-elapsed * 0.6); // Doubled the decay rate
  };

  // Update animation frame effect for 5 seconds
  useEffect(() => {
    if (!targetTimestamp) return;
    
    const animate = () => {
      if (Date.now() - targetTimestamp < 5000) { // 5 seconds
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [targetTimestamp]);

  // Add the function inside the component
  const calculateRadiusSum = (x: number, y: number) => {
    let radiusSum = 0;
    const newCellCoords = `${x}:${y}`;
    
    for (const [coords, cellValue] of cellValues.entries()) {
      // Skip the newly revealed cell
      if (coords === newCellCoords) continue;
      
      const [cellX, cellY] = coords.split(':').map(Number);
      const distance = calculateDistance(x, y, cellX, cellY);
      
      if (distance <= HIGHLIGHT_RADIUS) {
        // Only add numeric values to sum
        const numericValue = getNumericValue(cellValue);
        if (numericValue !== null) {
          radiusSum += numericValue;
        }
      }
    }
    
    return radiusSum;
  };

  // Add game started check at the top of the component
  const hasGameStarted = cellValues.size > 0;

  // Add touch event handlers to the grid container
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    });
    setInitialOffset(viewportOffset);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const deltaX = Math.round((e.touches[0].clientX - dragStart.x) / CELL_SIZE);
    const deltaY = Math.round((e.touches[0].clientY - dragStart.y) / CELL_SIZE);
    
    const halfWidth = Math.floor(viewportSize.width / 2);
    const halfHeight = Math.floor(viewportSize.height / 2);

    const maxX = MAX_COORD - halfWidth;
    const minX = MIN_COORD + halfWidth;
    const maxY = MAX_COORD - halfHeight;
    const minY = MIN_COORD + halfHeight;

    const newX = initialOffset.x + deltaX;
    const newY = initialOffset.y + deltaY;

    // Clamp values to prevent going out of bounds
    const clampedX = Math.min(maxX, Math.max(minX, newX));
    const clampedY = Math.min(maxY, Math.max(minY, newY));

    // Only update if within bounds
    if (clampedX >= minX && clampedX <= maxX && clampedY >= minY && clampedY <= maxY) {
      setViewportOffset({ x: clampedX, y: clampedY });
    }
  };

  // Update auto-play helper function
  const autoPlayMove = () => {
    // Stop if game is over or auto-play is off
    if (!isAutoPlaying || gameOver) {
      setIsAutoPlaying(false);
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
      return;
    }

    // Get all available cells in visible area
    const availableCells: {x: number, y: number}[] = [];
    getVisibleGrid().forEach(row => {
      row.forEach(cell => {
        if (!cell.isOutOfBounds && !cellValues.has(`${cell.x}:${cell.y}`)) {
          availableCells.push({ x: cell.x, y: cell.y });
        }
      });
    });

    // If there are available cells, pick one randomly
    if (availableCells.length > 0) {
      const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
      handlePixelClick(randomCell.x, randomCell.y);
      
      // Only schedule next move if game hasn't ended
      if (!gameOver) {
        autoPlayTimeoutRef.current = setTimeout(autoPlayMove, Math.random() * 500 + 200);
      }
    } else {
      setIsAutoPlaying(false);
    }
  };

  // Update effect to handle auto-play state changes
  useEffect(() => {
    if (isAutoPlaying && !gameOver) {
      autoPlayMove();
    }

    // Cleanup function to clear timeout
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [isAutoPlaying, gameOver]);

  // Add helper function to restart with autoplay
  const restartWithAutoplay = () => {
    restartGame();
    setIsAutoPlaying(true);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900">
      {/* Dynamic Logo */}
      <motion.h1 
        className="absolute top-4 left-4 z-10 font-black tracking-tight select-none
          flex flex-col items-start gap-0"
      >
        <motion.span 
          className="text-4xl sm:text-6xl bg-clip-text text-transparent"
          animate={{ 
            backgroundImage: LOGO_COLORS.map(([from, to]) => `linear-gradient(45deg, ${from}, ${to})`),
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 0
          }}
        >
          Radius
        </motion.span>
        <motion.span 
          className="text-4xl sm:text-6xl -mt-2 bg-clip-text text-transparent"
          animate={{ 
            backgroundImage: LOGO_COLORS.map(([from, to]) => `linear-gradient(45deg, ${from}, ${to})`),
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
        >
          Impact
        </motion.span>
      </motion.h1>

      {/* White Coordinate Input with dropdown trigger */}
      <div className="absolute top-4 right-4 z-10">
        {showNavigator ? (
          <form 
            onSubmit={handleCoordSubmit}
            className="flex flex-col gap-2 bg-white/90 backdrop-blur p-3 
              rounded-xl shadow-lg border border-white/50"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={coordInput}
                onChange={(e) => {
                  setInputError(null);
                  setCoordInput(e.target.value);
                }}
                placeholder="x:y"
                pattern="-?\d+:-?\d+"
                className={`w-32 px-3 py-2 rounded-lg
                  bg-gray-50 text-gray-900
                  placeholder-gray-400
                  focus:ring-2 focus:ring-white focus:ring-offset-2
                  outline-none transition-all font-medium text-lg
                  border-2 ${inputError ? 'border-red-500' : 'border-white'}
                  shadow-inner`}
                title={`Format: x:y (e.g., 100:-200) Range: ${MIN_COORD} to ${MAX_COORD}`}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-gray-900 rounded-lg shadow-lg
                  hover:bg-gray-50 active:bg-gray-100 transition-all font-bold text-lg
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                  border-2 border-white"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setShowNavigator(false)}
                className="p-2 bg-white text-2xl rounded-lg shadow-lg
                  hover:bg-gray-50 active:bg-gray-100 transition-all
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                  border-2 border-white"
                title="Close Navigator"
              >
                🧭
              </button>
            </div>
            {inputError && (
              <div className="text-red-500 text-sm font-medium px-1">
                {inputError}
              </div>
            )}
          </form>
        ) : (
          <button
            onClick={() => setShowNavigator(true)}
            className="p-3 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-white/50
              hover:bg-white/100 transition-all text-2xl"
            title="Open Navigator"
          >
            🧭
          </button>
        )}
      </div>

      {/* Updated score display with calculation dropdown */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50 
          flex items-center gap-3">
          <div className="text-xl font-bold text-gray-900">
            Your Score: {score}
          </div>
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg 
              className={`w-5 h-5 transform transition-transform ${showCalculation ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="black"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => setShowRules(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl"
            title="Game Rules"
          >
            ❓
          </button>
        </div>
        
        {/* Calculation details */}
        {showCalculation && (
          <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50
            text-gray-900 font-medium">
            {hasGameStarted ? (
              lastCalculation ? (
                <>
                  <div>New Value: {lastCalculation.newValue}</div>
                  {!isSpecialCell(lastCalculation.newValue) && (
                    <>
                      <div>Radius Sum: {lastCalculation.radiusSum}</div>
                      <div>Multiplier: {lastCalculation.multiplier}</div>
                      <div className="mt-2 pt-2 border-t border-gray-200 font-bold">
                        Total Added: {lastCalculation.total}
                      </div>
                    </>
                  )}
                  {lastCalculation.specialEffect && (
                    <div className="mt-2 pt-2 border-t border-gray-200 font-bold text-red-500">
                      {lastCalculation.specialEffect}
                    </div>
                  )}
                </>
              ) : (
                <div>No calculations yet</div>
              )
            ) : (
              <div>Start game to see round result</div>
            )}
          </div>
        )}
      </div>

      {/* Auto-play button */}
      <div className="absolute bottom-4 right-4 z-10">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`p-4 rounded-xl shadow-lg transition-all font-bold text-2xl
            ${isAutoPlaying 
              ? 'bg-red-500 hover:bg-red-600 active:bg-red-700' 
              : 'bg-white hover:bg-gray-50 active:bg-gray-100'}
            border-2 border-white`}
          title={isAutoPlaying ? 'Stop Auto-play' : 'Start Auto-play'}
        >
          🤖
        </button>
      </div>

      <div 
        ref={containerRef}
        className={`w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleGridMouseEnter}
        onMouseLeave={handleGridMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        <div 
          className="grid gap-0.5 bg-gray-50"
          style={{ 
            gridTemplateColumns: `repeat(${viewportSize.width}, ${CELL_SIZE}px)`,
            width: viewportSize.width * CELL_SIZE + 'px',
            height: viewportSize.height * CELL_SIZE + 'px'
          }}
        >
          {getVisibleGrid().map((row, i) => 
            row.map((cell, j) => {
              // Only calculate highlights if grid is hovered
              const distance = (isGridHovered && hoveredCoords)
                ? calculateDistance(cell.x, cell.y, hoveredCoords.x, hoveredCoords.y)
                : null;
              
              const isWithinRadius = distance !== null && distance <= HIGHLIGHT_RADIUS;
              
              const highlightOpacity = isWithinRadius 
                ? Math.max(0.1, 1 - (distance / HIGHLIGHT_RADIUS)) * 0.3
                : 0;

              return (
                <div
                  key={`${cell.x}:${cell.y}`}
                  data-coords={`${cell.x}:${cell.y}`}
                  className={`
                    ${getBurnColor(`${cell.x}:${cell.y}`, cell.color)}
                    ${!cell.isOutOfBounds && isGridHovered && !cellValues.has(`${cell.x}:${cell.y}`) 
                      ? 'hover:ring-2 hover:ring-[#ff0000] hover:ring-opacity-100 hover:z-10' 
                      : ''} 
                    ${cell.isTarget ? 'ring-2 ring-[#ff0000]' : ''}
                    ${isWithinRadius && !cell.isOutOfBounds ? 'ring-2 ring-[#ff1111]' : ''}
                    ${isDragging ? '' : 'cursor-pointer'}
                    ${blinkingCells.has(`${cell.x}:${cell.y}`) ? 'animate-pulse' : ''}
                    transition-all shadow-sm relative
                    flex items-center justify-center font-bold
                  `}
                  style={{
                    width: CELL_SIZE + 'px',
                    height: CELL_SIZE + 'px',
                    ...(isWithinRadius && !cell.isOutOfBounds ? {
                      '--tw-ring-opacity': highlightOpacity * 1.2,
                      ...(pixels.has(`${cell.x}:${cell.y}`) && {
                        filter: `brightness(${1 + highlightOpacity * 2.5})`
                      })
                    } : {}),
                    ...(cell.isTarget ? {
                      '--tw-ring-opacity': getTargetOpacity()
                    } : {}),
                    transitionDuration: isBurning ? '500ms' : '150ms',
                  }}
                  onClick={() => !isDragging && !cell.isOutOfBounds && handlePixelClick(cell.x, cell.y)}
                >
                  {/* Show cell value if selected with dynamic font size */}
                  {cellValues.has(`${cell.x}:${cell.y}`) && (
                    <span className={`select-none text-gray-900 ${
                      isSpecialCell(cellValues.get(`${cell.x}:${cell.y}`)!)
                        ? 'text-xl font-black'
                        : getValueFontSize(cellValues.get(`${cell.x}:${cell.y}`) as number)
                    } ${burningCells.has(`${cell.x}:${cell.y}`) ? 'opacity-0' : ''} transition-opacity`}>
                      {cellValues.get(`${cell.x}:${cell.y}`)}
                    </span>
                  )}
                  {/* Only show tooltip when grid is hovered */}
                  {isGridHovered && hoveredCoords && hoveredCoords.x === cell.x && hoveredCoords.y === cell.y && (
                    <div className={`absolute ${getTooltipPosition(cell, viewportSize)}
                      px-4 py-2 bg-white text-gray-900 text-lg rounded-xl shadow-xl 
                      font-bold border-2 border-white whitespace-nowrap backdrop-blur-sm
                      bg-white/90 z-20`}
                    >
                      {cell.x}:{-cell.y}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Game Over Popup */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/60 z-50 
          flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4
            flex flex-col items-center gap-6">
            <h2 className="text-3xl font-black text-gray-900">
              {gameOver.reason}
            </h2>
            <p className="text-xl font-bold text-gray-700">
              Final Score: {gameOver.score}
            </p>
            
            {/* Share buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={getShareUrls(gameOver.score).twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085a4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href={getShareUrls(gameOver.score).telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#0088cc] text-white hover:opacity-90 transition-opacity"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </a>
              <a
                href={getShareUrls(gameOver.score).facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={getShareUrls(gameOver.score).wechat}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#07C160] text-white hover:opacity-90 transition-opacity"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2C3.891 2 0 5.288 0 9.342c0 2.212 1.17 4.203 3.002 5.55.183.15.298.39.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446C13.137 8.77 15.316 8.205 17.287 8.347c-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.133 0 .24-.11.24-.246 0-.06-.024-.12-.04-.177l-.325-1.233a.492.492 0 01.177-.554c1.529-1.125 2.531-2.825 2.531-4.724 0-3.176-3.087-5.866-7.09-6.018zm-2.46 3.942c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
                </svg>
              </a>
              <button
                onClick={copyToClipboard}
                className="p-3 rounded-xl bg-gray-800 text-white hover:opacity-90 transition-opacity"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                </svg>
              </button>
            </div>

            {/* Add buttons container with gap */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={restartGame}
                className="px-8 py-3 bg-red-500 text-white rounded-xl shadow-lg
                  hover:bg-red-600 active:bg-red-700 transition-colors
                  font-bold text-lg"
              >
                Play Again
              </button>
              
              <button
                onClick={restartWithAutoplay}
                className="p-3 bg-blue-500 text-white rounded-xl shadow-lg
                  hover:bg-blue-600 active:bg-blue-700 transition-colors
                  text-2xl"
                title="Play with Bot"
              >
                🤖
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Rules Popup */}
      {showRules && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">Game Rules</h2>
              <button 
                onClick={() => setShowRules(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl"
                title="Close"
              >
                ✖️
              </button>
            </div>

            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-xl font-bold mb-2">Basic Mechanics</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Click any cell to reveal a random value (-23 to 20)</li>
                  <li>Each revealed number affects cells within a 15-unit radius</li>
                  <li>Score calculation: New value + (Sum of values in radius × |New value|)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-2">Special Cells</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><span className="font-bold">X</span>: Game Over - Ends game immediately, score becomes 0</li>
                  <li><span className="font-bold">I</span>: Invert Score - Multiplies your current score by -1</li>
                  <li><span className="font-bold">Z</span>: Zero Score - Resets your score to 0</li>
                  <li><span className="font-bold">F</span>: Finish Game - Ends the game, keeping your current score</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-2">Navigation</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Drag the grid to explore</li>
                  <li>Use the 🧭 navigator to jump to specific coordinates</li>
                  <li>Valid coordinate range: -10000 to 10000</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-2">Strategy Tips</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Look for high positive numbers to multiply radius values</li>
                  <li>Be cautious with negative numbers - they can reduce your score</li>
                  <li>Special cells appear randomly - they can help or hurt your strategy</li>
                  <li>Plan your moves to maximize the radius effect</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
