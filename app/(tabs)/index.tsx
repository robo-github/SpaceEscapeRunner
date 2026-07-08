import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Spaceship constants
const SHIP_WIDTH = 60;
const SHIP_HEIGHT = 75; // Total height: nose (25) + body (40) + thruster (10)
const SHIP_Y = SCREEN_HEIGHT - 220; // Fixed vertical position above the controls

// Asteroid & Game constants
const ASTEROID_SIZE = 50;
const MOVEMENT_STEP = 30;
const GAME_SPEED = 15; // Pixels the asteroid falls per frame

export default function HomeScreen() {
  // --- 1. SHIP STATE ---
  const [shipX, setShipX] = useState(SCREEN_WIDTH / 2 - SHIP_WIDTH / 2);
  
  // We use a ref for shipX so our Game Loop (setInterval) can always read the 
  // most recent ship position without needing to restart the interval every time we move.
  const shipXRef = useRef(shipX);
  useEffect(() => {
    shipXRef.current = shipX;
  }, [shipX]);

  // --- 2. GAME STATE ---
  const [gameState, setGameState] = useState({
    asteroidX: Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE),
    asteroidY: -ASTEROID_SIZE, // Start above the screen
    score: 0,
    gameOver: false,
  });

  // --- 3. GAME LOOP & COLLISION DETECTION ---
  useEffect(() => {
    // If the game is over, stop the loop
    if (gameState.gameOver) return;

    const intervalId = setInterval(() => {
      setGameState((prev) => {
        const currentShipX = shipXRef.current;
        const newY = prev.asteroidY + GAME_SPEED; // Calculate next position
        
        // COLLISION DETECTION (Axis-Aligned Bounding Box)
        // We check if the asteroid rectangle overlaps with the ship rectangle.
        const isColliding = 
          prev.asteroidX < currentShipX + SHIP_WIDTH &&  // Asteroid left edge < Ship right edge
          prev.asteroidX + ASTEROID_SIZE > currentShipX && // Asteroid right edge > Ship left edge
          newY < SHIP_Y + SHIP_HEIGHT &&                 // Asteroid top edge < Ship bottom edge
          newY + ASTEROID_SIZE > SHIP_Y;                 // Asteroid bottom edge > Ship top edge

        if (isColliding) {
          return { ...prev, gameOver: true }; // Stop game, show Game Over screen
        }

        // DODGED ASTEROID (Passed the bottom of the screen)
        if (newY > SCREEN_HEIGHT) {
          return {
            ...prev,
            asteroidY: -ASTEROID_SIZE, // Reset to top
            asteroidX: Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE), // New random X position
            score: prev.score + 1, // Increase the score!
          };
        }

        // NORMAL MOVEMENT: Just move the asteroid down
        return { ...prev, asteroidY: newY };
      });
    }, 30); // Runs roughly 33 times a second (30ms per frame)

    // Cleanup function stops the interval when the component unmounts or game over state changes
    return () => clearInterval(intervalId);
  }, [gameState.gameOver]);

  // --- 4. CONTROLS ---
  const moveLeft = () => {
    setShipX((prevX) => Math.max(0, prevX - MOVEMENT_STEP));
  };

  const moveRight = () => {
    setShipX((prevX) => Math.min(SCREEN_WIDTH - SHIP_WIDTH, prevX + MOVEMENT_STEP));
  };

  const restartGame = () => {
    setGameState({
      asteroidX: Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE),
      asteroidY: -ASTEROID_SIZE,
      score: 0,
      gameOver: false,
    });
    setShipX(SCREEN_WIDTH / 2 - SHIP_WIDTH / 2); // Recenter ship
  };

  return (
    <View style={styles.container}>
      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {gameState.score}</Text>
      </View>

      {/* Spaceship */}
      <View style={[styles.spaceshipContainer, { left: shipX, top: SHIP_Y }]}>
        <View style={styles.shipNose} />
        <View style={styles.shipBody} />
        <View style={styles.shipWings} />
        <View style={styles.shipThruster} />
      </View>

      {/* Asteroid (Hidden if Game Over) */}
      {!gameState.gameOver && (
        <View 
          style={[
            styles.asteroid, 
            { left: gameState.asteroidX, top: gameState.asteroidY }
          ]} 
        />
      )}

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverTitle}>GAME OVER</Text>
          <Text style={styles.finalScoreText}>Final Score: {gameState.score}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
            <Text style={styles.controlText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls Area */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={moveLeft}>
          <Text style={styles.controlText}>Move Left</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={moveRight}>
          <Text style={styles.controlText}>Move Right</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark space-like background
  },
  scoreContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  spaceshipContainer: {
    position: 'absolute',
    width: SHIP_WIDTH,
    height: SHIP_HEIGHT,
    alignItems: 'center',
    zIndex: 5,
  },
  shipNose: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#38BDF8', 
  },
  shipBody: {
    width: 30,
    height: 40,
    backgroundColor: '#E2E8F0', 
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    zIndex: 2, 
  },
  shipWings: {
    position: 'absolute',
    top: 40, // Drops the wings down slightly past the nose
    width: 60,
    height: 15,
    backgroundColor: '#EF4444', 
    borderRadius: 5,
    zIndex: 1, 
  },
  shipThruster: {
    width: 14,
    height: 10,
    backgroundColor: '#F59E0B', 
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  asteroid: {
    position: 'absolute',
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
    backgroundColor: '#94A3B8', // Slate grey
    borderRadius: ASTEROID_SIZE / 2, // Perfect circle
    borderWidth: 3,
    borderColor: '#64748B',
    zIndex: 4,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire screen
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  gameOverTitle: {
    color: '#EF4444', // Red text
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalScoreText: {
    color: '#FFF',
    fontSize: 24,
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#10B981', // Green button
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 40, // safe area padding
    paddingTop: 20,
    backgroundColor: '#1E293B',
    borderTopWidth: 2,
    borderTopColor: '#334155',
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controlText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
