import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// Spaceship constants
const SHIP_WIDTH = 70; 
const SHIP_HEIGHT = 70; 
const SHIP_Y = SCREEN_HEIGHT - 220;

// Asteroid & Game constants
const ASTEROID_SIZE = 50;
const MOVEMENT_STEP = 40; 
const GAME_SPEED = 9; 

export default function HomeScreen() {
  // --- 1. SHIP STATE (ANIMATED) ---
  const initialShipX = SCREEN_WIDTH / 2 - SHIP_WIDTH / 2;
  const shipXAnim = useRef(new Animated.Value(initialShipX)).current;
  const shipXRef = useRef(initialShipX);

  useEffect(() => {
    const id = shipXAnim.addListener(({ value }) => {
      shipXRef.current = value;
    });
    return () => shipXAnim.removeListener(id);
  }, [shipXAnim]);

  // --- 2. GAME STATE ---
  const [gameState, setGameState] = useState({
    asteroidX: Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE),
    asteroidY: -ASTEROID_SIZE, 
    score: 0,
    gameOver: false,
    gameStarted: false, // NEW: Start screen state
  });

  const [highScore, setHighScore] = useState(0);

  // --- 3. LOAD/SAVE HIGH SCORE ---
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedScore = await AsyncStorage.getItem('highScore');
        if (savedScore !== null) {
          setHighScore(parseInt(savedScore, 10));
        }
      } catch (error) {
        console.error('Error loading high score:', error);
      }
    };
    loadHighScore();
  }, []);

  useEffect(() => {
    const saveHighScore = async () => {
      if (gameState.gameOver && gameState.score > highScore) {
        setHighScore(gameState.score); 
        try {
          await AsyncStorage.setItem('highScore', gameState.score.toString());
        } catch (error) {
          console.error('Error saving high score:', error);
        }
      }
    };
    saveHighScore();
  }, [gameState.gameOver]);

  // --- 4. GAME LOOP & COLLISION DETECTION ---
  useEffect(() => {
    // If the game hasn't started or is over, do not run the loop
    if (!gameState.gameStarted || gameState.gameOver) return;

    const intervalId = setInterval(() => {
      setGameState((prev) => {
        const currentShipX = shipXRef.current;
        const newY = prev.asteroidY + GAME_SPEED; 
        
        // COLLISION DETECTION 
        const isColliding = 
          prev.asteroidX < currentShipX + SHIP_WIDTH - 10 &&  
          prev.asteroidX + ASTEROID_SIZE > currentShipX + 10 && 
          newY < SHIP_Y + SHIP_HEIGHT &&                 
          newY + ASTEROID_SIZE > SHIP_Y + 10;                 

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
    }, 16); 

    return () => clearInterval(intervalId);
  }, [gameState.gameStarted, gameState.gameOver]);

  // --- 5. SMOOTH CONTROLS ---
  const moveLeft = () => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    const newX = Math.max(0, shipXRef.current - MOVEMENT_STEP);
    Animated.timing(shipXAnim, {
      toValue: newX,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const moveRight = () => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    const newX = Math.min(SCREEN_WIDTH - SHIP_WIDTH, shipXRef.current + MOVEMENT_STEP);
    Animated.timing(shipXAnim, {
      toValue: newX,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true, 
    }).start();
  };

  const startGame = () => {
    setGameState({
      asteroidX: Math.random() * (SCREEN_WIDTH - ASTEROID_SIZE),
      asteroidY: -ASTEROID_SIZE,
      score: 0,
      gameOver: false,
      gameStarted: true,
    });
    // Instantly reset ship position
    shipXAnim.setValue(initialShipX);
  };

  return (
    <LinearGradient 
      colors={['#0F172A', '#1E1B4B', '#000000']} 
      style={styles.container}
    >
      {/* Modern Glassmorphic Score Display */}
      {gameState.gameStarted && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>SCORE: {gameState.score}</Text>
          <Text style={styles.highScoreText}>BEST: {highScore}</Text>
        </View>
      )}

      {/* Upgraded Spaceship */}
      <Animated.View style={[styles.spaceshipContainer, { top: SHIP_Y, transform: [{ translateX: shipXAnim }] }]}>
        <View style={styles.shipWings} />
        <View style={styles.shipBody}>
          <View style={styles.cockpit} />
        </View>
        <View style={styles.shipThruster} />
      </Animated.View>

      {/* Upgraded Asteroid */}
      {gameState.gameStarted && !gameState.gameOver && (
        <View style={[styles.asteroid, { left: gameState.asteroidX, top: gameState.asteroidY }]}>
          <View style={styles.crater1} />
          <View style={styles.crater2} />
          <View style={styles.crater3} />
        </View>
      )}

      {/* Start Screen */}
      {!gameState.gameStarted && !gameState.gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.mainTitleText}>SPACE ESCAPE</Text>
          <Text style={styles.finalScoreText}>High Score: {highScore}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={startGame}>
            <Text style={styles.restartButtonText}>START MISSION</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game Over Screen */}
      {gameState.gameOver && (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverTitle}>SYSTEM FAILURE</Text>
          <Text style={styles.finalScoreText}>Final Score: {gameState.score}</Text>
          
          {gameState.score >= highScore && gameState.score > 0 && (
            <Text style={styles.newHighScoreText}>🚀 NEW RECORD! 🚀</Text>
          )}

          <TouchableOpacity style={styles.restartButton} onPress={startGame}>
            <Text style={styles.restartButtonText}>REBOOT SEQUENCE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls Area */}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={moveLeft} activeOpacity={0.7}>
          <Text style={styles.controlText}>← LEFT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={moveRight} activeOpacity={0.7}>
          <Text style={styles.controlText}>RIGHT →</Text>
        </TouchableOpacity>
      </LinearGradient>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scoreContainer: {
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  scoreText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  highScoreText: {
    color: '#38BDF8', 
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 2,
  },
  spaceshipContainer: {
    position: 'absolute',
    width: SHIP_WIDTH,
    alignItems: 'center',
    zIndex: 5,
  },
  shipBody: {
    width: 36,
    height: 50,
    backgroundColor: '#F8FAFC', 
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    zIndex: 2, 
    alignItems: 'center',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  cockpit: {
    width: 18,
    height: 22,
    backgroundColor: '#0EA5E9',
    borderRadius: 9,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#7DD3FC',
  },
  shipWings: {
    position: 'absolute',
    top: 25, 
    width: 70,
    height: 25,
    backgroundColor: '#E11D48', 
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: 1, 
  },
  shipThruster: {
    width: 16,
    height: 14,
    backgroundColor: '#F59E0B', 
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  asteroid: {
    position: 'absolute',
    width: ASTEROID_SIZE,
    height: ASTEROID_SIZE,
    backgroundColor: '#475569', 
    borderRadius: ASTEROID_SIZE / 2, 
    borderWidth: 2,
    borderColor: '#334155',
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 8,
  },
  crater1: {
    position: 'absolute',
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#334155',
    top: 8, left: 10,
  },
  crater2: {
    position: 'absolute',
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#334155',
    bottom: 12, right: 10,
  },
  crater3: {
    position: 'absolute',
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#334155',
    top: 25, left: 22,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0, 0, 0, 0.85)', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  mainTitleText: {
    color: '#38BDF8',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  gameOverTitle: {
    color: '#F43F5E', 
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  finalScoreText: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  newHighScoreText: {
    color: '#FBBF24', 
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#10B981', 
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  restartButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 50, 
    paddingTop: 40,
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  controlText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
