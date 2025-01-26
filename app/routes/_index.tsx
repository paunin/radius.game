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

// Add these color arrays near other constants
const LOGO_COLORS = [
  ["#ff0000", "#ff3300"],  // Red to Orange
  ["#ff3300", "#ff6600"],  // Orange to Darker Orange
  ["#ff6600", "#ff9900"],  // Orange to Yellow
  ["#ff9900", "#ffcc00"],  // Yellow to Light Yellow
  ["#ffcc00", "#ffff00"],  // Yellow to Bright Yellow
  ["#ffff00", "#ccff00"],  // Yellow to Lime
  ["#ccff00", "#99ff00"],  // Lime to Light Green
  ["#99ff00", "#66ff00"],  // Light Green to Green
  ["#66ff00", "#33ff00"],  // Green to Bright Green
  ["#33ff00", "#00ff00"],  // Bright Green
  ["#00ff00", "#00ff33"],  // Green to Cyan
  ["#00ff33", "#00ff66"],  // Cyan shades
  ["#00ff66", "#00ff99"],
  ["#00ff99", "#00ffcc"],
  ["#00ffcc", "#00ffff"],  // Cyan to Blue
  ["#00ffff", "#00ccff"],
  ["#00ccff", "#0099ff"],
  ["#0099ff", "#0066ff"],
  ["#0066ff", "#0033ff"],
  ["#0033ff", "#0000ff"],  // Blue
  ["#0000ff", "#3300ff"],  // Blue to Purple
  ["#3300ff", "#6600ff"],
  ["#6600ff", "#9900ff"],
  ["#9900ff", "#cc00ff"],
  ["#cc00ff", "#ff00ff"],  // Purple to Pink
  ["#ff00ff", "#ff00cc"],
  ["#ff00cc", "#ff0099"],
  ["#ff0099", "#ff0066"],
  ["#ff0066", "#ff0033"],
  ["#ff0033", "#ff0000"],  // Back to Red
];

// Update cell value constants
const MIN_CELL_VALUE = -23;
const MAX_CELL_VALUE = 20;

// Add helper function to determine font size based on value
const getValueFontSize = (value: number) => {
  const numDigits = Math.abs(value).toString().length + (value < 0 ? 1 : 0);
  if (numDigits <= 1) return 'text-xl';
  if (numDigits === 2) return 'text-lg';
  return 'text-base';
};

// Update special cell configuration
const SPECIAL_CELLS = {
  X: { chance: 1/25, label: 'Game Over' },
  I: { chance: 1/10, label: 'Invert Score' },
  Z: { label: 'Zero Score', chance: 1/15 },
  F: { chance: 1/20, label: 'Finish Game' }
} as const;

type SpecialCell = keyof typeof SPECIAL_CELLS;
type CellValue = number | SpecialCell;

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
  return typeof value === 'number' ? value : null;
};

export default function Index() {
  const [pixels, setPixels] = useState<Map<string, string>>(new Map());
  const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 });
  const [hoveredCoords, setHoveredCoords] = useState<{ x: number, y: number } | null>(null);
  const [targetCoords, setTargetCoords] = useState<{ x: number, y: number } | null>(null);
  const [coordInput, setCoordInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 31, height: 31 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 });
  const [inputError, setInputError] = useState<string | null>(null);
  const [isGridHovered, setIsGridHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [targetTimestamp, setTargetTimestamp] = useState<number | null>(null);
  // Add new state for cell values and score
  const [cellValues, setCellValues] = useState<Map<string, CellValue>>(new Map());
  const [score, setScore] = useState(0);
  // Add state for tracking cells involved in last calculation
  const [blinkingCells, setBlinkingCells] = useState<Set<string>>(new Set());
  const [blinkTimestamp, setBlinkTimestamp] = useState<number | null>(null);
  // Add to state declarations
  const [lastCalculation, setLastCalculation] = useState<LastCalculation>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  // Add these inside the component
  const [gameOver, setGameOver] = useState<{ score: number, reason: string } | null>(null);
  
  // Add restart function inside component
  const restartGame = () => {
    setScore(0);
    setCellValues(new Map());
    setPixels(new Map());
    setSelectedColor(null);
    setGameOver(null);
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

  // Update calculateNewScore to handle special cells
  const calculateNewScore = (x: number, y: number, value: number) => {
    let radiusSum = 0;
    const involvedCells = new Set<string>();
    const newCellCoords = `${x}:${y}`;
    
    // Sum up all values within radius (excluding the new cell)
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

  // Update handlePixelClick with F cell and game over handling
  const handlePixelClick = (x: number, y: number) => {
    if (gameOver) return; // Prevent clicks when game is over
    
    if (x >= MIN_COORD && x <= MAX_COORD && 
        y >= MIN_COORD && y <= MAX_COORD && 
        !cellValues.has(`${x}:${y}`)) {
      const coords = `${x}:${y}`;
      
      let value: CellValue;
      const rand = Math.random();
      let specialEffect: string | undefined;
      let cumChance = 0;

      // Handle special cells with cumulative probability
      if (rand < (cumChance += SPECIAL_CELLS.X.chance)) {
        value = 'X';
        specialEffect = 'Game Over!';
        setGameOver({ score: 0, reason: 'Game Over!' });
        setScore(0);
      } else if (rand < (cumChance += SPECIAL_CELLS.F.chance)) {
        value = 'F';
        specialEffect = 'Game Finished!';
        setGameOver({ score, reason: 'Game Finished!' });
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

      if (!isSpecialCell(value)) {
        // Regular number calculation
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

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900">
      {/* Dynamic Logo */}
      <motion.h1 
        className="absolute top-4 left-4 z-10 text-6xl font-black tracking-tight bg-clip-text text-transparent select-none"
        animate={{ 
          backgroundImage: LOGO_COLORS.map(([from, to]) => `linear-gradient(45deg, ${from}, ${to})`),
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        Radius
      </motion.h1>

      {/* White Coordinate Input */}
      <form 
        onSubmit={handleCoordSubmit}
        className="absolute top-4 right-4 flex flex-col gap-2 z-10 bg-white/90 backdrop-blur p-3 
          rounded-xl shadow-lg border border-white/50"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={coordInput}
            onChange={(e) => {
              setInputError(null);
              setCoordInput(e.target.value);
            }}
            placeholder="x:y"
            pattern="-?\d+:-?\d+"
            className={`px-4 py-2 rounded-lg
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
            className="px-6 py-2 bg-white text-gray-900 rounded-lg shadow-lg
              hover:bg-gray-50 active:bg-gray-100 transition-all font-bold text-lg
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
              border-2 border-white"
          >
            Go
          </button>
        </div>
        {inputError && (
          <div className="text-red-500 text-sm font-medium px-1">
            {inputError}
          </div>
        )}
      </form>

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
        </div>
        
        {/* Calculation details */}
        {showCalculation && lastCalculation && (
          <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50
            text-gray-900 font-medium">
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
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className={`w-full h-full overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleGridMouseEnter}
        onMouseLeave={handleGridMouseLeave}
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
                    ${cell.color}
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
                    } : {})
                  }}
                  onClick={() => !isDragging && !cell.isOutOfBounds && handlePixelClick(cell.x, cell.y)}
                >
                  {/* Show cell value if selected with dynamic font size */}
                  {cellValues.has(`${cell.x}:${cell.y}`) && (
                    <span className={`select-none text-gray-900 ${
                      isSpecialCell(cellValues.get(`${cell.x}:${cell.y}`))
                        ? 'text-xl font-black'
                        : getValueFontSize(cellValues.get(`${cell.x}:${cell.y}`) as number)
                    }`}>
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
        <div className="fixed inset-0 bg-black/30 z-50 
          flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4
            flex flex-col items-center gap-6">
            <h2 className="text-3xl font-black text-gray-900">
              {gameOver.reason}
            </h2>
            <p className="text-xl font-bold text-gray-700">
              Final Score: {gameOver.score}
            </p>
            <button
              onClick={restartGame}
              className="px-8 py-3 bg-red-500 text-white rounded-xl shadow-lg
                hover:bg-red-600 active:bg-red-700 transition-colors
                font-bold text-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
