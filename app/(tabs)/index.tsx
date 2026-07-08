import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const [highScore, setHighScore] = useState(0);

  // --- 3. LOAD HIGH SCORE ON START ---
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedScore = await AsyncStorage.getItem('highScore');
        if (savedScore !== null) {
          setHighScore(parseInt(savedScore, 10)); // Convert string back to number
        }
      } catch (error) {
        console.error('Error loading high score:', error);
      }
    };
    loadHighScore();
  }, []); // Empty dependency array means this runs only once when the app starts

  // --- 4. SAVE HIGH SCORE ON GAME OVER ---
  useEffect(() => {
    const saveHighScore = async () => {
      // Only check and save when the game transitions to a "game over" state
      if (gameState.gameOver && gameState.score > highScore) {
        setHighScore(gameState.score); // Update the state immediately for UI
        try {
          // AsyncStorage only saves strings, so we convert the number to a string
          await AsyncStorage.setItem('highScore', gameState.score.toString());
        } catch (error) {
          console.error('Error saving high score:', error);
        }
      }
    };
    saveHighScore();
  }, [gameState.gameOver]); // Runs whenever gameOver state changes

  // --- 5. GAME LOOP & COLLISION DETECTION ---
  useEffect(() => {
    if (gameState.gameOver) return;

    const intervalId = setInterval(() => {
      setGameState((prev) => {
        const currentShipX = shipXRef.current;
        const newY = prev.asteroidY + GAME_SPEED; 
        
        // COLLISION DETECTION 
        const isColliding = 
          prev.asteroidX < currentShipX + SHIP_WIDTH &&  
          prev.asteroidX + ASTEROID_SIZE > currentShipX && 
          newY < SHIP_Y + SHIP_HEIGHT &&                 
          newY + ASTEROID_SIZE > SHIP_Y;                 

        if (isColliding) {
          return { ...prev, gameOver: true }; 
        }

        // DODGED ASTEROID
        if (newY > SCREEN_HEIGHT) {
          return {
            ...prev,
            asteroidY: -ASTEROID_SIZE, 
            asteroidX: Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE), 
            score: prev.score + 1, 
          };
        }

        return { ...prev, asteroidY: newY };
      });
    }, 30); 

    return () => clearInterval(intervalId);
  }, [gameState.gameOver]);

  // --- 6. CONTROLS & RESTART ---
  const moveLeft = () => {
    setShipX((prevX) => Math.max(0, prevX - MOVEMENT_STEP));
  };

  const moveRight = () => {
    setShipX((prevX) => Math.min(SCREEN_WIDTH - SHIP_WIDTH, prevX + MOVEMENT_STEP));
  };

  const restartGame = () => {
    // 1. Reset asteroid position and score, remove game over flag
    setGameState({
      asteroidX: Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE),
      asteroidY: -ASTEROID_SIZE,
      score: 0,
      gameOver: false,
    });
    // 2. Reset spaceship position to the center of the screen
    setShipX(SCREEN_WIDTH / 2 - SHIP_WIDTH / 2);
  };

  return (
    <View style={styles.container}>
      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {gameState.score}</Text>
        <Text style={styles.highScoreText}>Best: {highScore}</Text>
      </View>

      {/* Spaceship */}
      <View style={[styles.spaceshipContainer, { left: shipX, top: SHIP_Y }]}>
        <View style={styles.shipNose} />
        <View style={styles.shipBody} />
        <View style={styles.shipWings} />
        <View style={styles.shipThruster} />
      </View>

      {/* Asteroid */}
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
          
          {gameState.score >= highScore && gameState.score > 0 && (
            <Text style={styles.newHighScoreText}>🎉 New High Score! 🎉</Text>
          )}

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
    backgroundColor: '#0F172A', 
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
  highScoreText: {
    color: '#94A3B8', // Lighter grey for high score
    fontSize: 16,
    marginTop: 4,
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
    top: 40, 
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
    backgroundColor: '#94A3B8', 
    borderRadius: ASTEROID_SIZE / 2, 
    borderWidth: 3,
    borderColor: '#64748B',
    zIndex: 4,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0, 0, 0, 0.85)', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  gameOverTitle: {
    color: '#EF4444', 
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalScoreText: {
    color: '#FFF',
    fontSize: 24,
    marginBottom: 10,
  },
  newHighScoreText: {
    color: '#F59E0B', // Gold/orange color
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#10B981', 
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 20,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 40, 
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
    elevation: 3, 
    shadowColor: '#000', 
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
