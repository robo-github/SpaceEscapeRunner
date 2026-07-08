import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SHIP_WIDTH = 60;
const MOVEMENT_STEP = 30;

export default function HomeScreen() {
  // 1. Initialize State
  // We calculate the center of the screen by taking the screen width and subtracting half the ship's width.
  const [shipX, setShipX] = useState(SCREEN_WIDTH / 2 - SHIP_WIDTH / 2);

  // 2. Move Left logic
  const moveLeft = () => {
    setShipX((prevX) => {
      // Math.max ensures the ship's X position never goes below 0 (the left boundary)
      return Math.max(0, prevX - MOVEMENT_STEP);
    });
  };

  // 3. Move Right logic
  const moveRight = () => {
    setShipX((prevX) => {
      // Math.min ensures the ship's X position never exceeds the right screen boundary
      // Right boundary is SCREEN_WIDTH minus SHIP_WIDTH (so the ship doesn't overflow)
      return Math.min(SCREEN_WIDTH - SHIP_WIDTH, prevX + MOVEMENT_STEP);
    });
  };

  return (
    <View style={styles.container}>
      {/* Game Area */}
      <View style={styles.gameArea}>
        {/* Spaceship */}
        <View style={[styles.spaceshipContainer, { left: shipX }]}>
          {/* Nose of the ship (Triangle using borders) */}
          <View style={styles.shipNose} />
          {/* Main body of the ship */}
          <View style={styles.shipBody} />
          {/* Wings of the ship */}
          <View style={styles.shipWings} />
          {/* Engine thruster */}
          <View style={styles.shipThruster} />
        </View>
      </View>

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
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  spaceshipContainer: {
    position: 'absolute',
    bottom: 20,          // Positioned at the bottom of the game area
    width: SHIP_WIDTH,   // Fixed width
    alignItems: 'center',// Centers the nested shapes horizontally
  },
  shipNose: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    // Triangle border trick: transparent left/right borders and colored bottom border
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#38BDF8', // Light blue nose
  },
  shipBody: {
    width: 30,
    height: 40,
    backgroundColor: '#E2E8F0', // Light gray body
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    zIndex: 2, // Ensure body sits above the wings
  },
  shipWings: {
    position: 'absolute',
    bottom: 10,
    width: 60,
    height: 15,
    backgroundColor: '#EF4444', // Red wings
    borderRadius: 5,
    zIndex: 1, // Sit behind the body
  },
  shipThruster: {
    width: 14,
    height: 10,
    backgroundColor: '#F59E0B', // Orange thruster flame
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#1E293B',
    borderTopWidth: 2,
    borderTopColor: '#334155',
  },
  controlButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  controlText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
