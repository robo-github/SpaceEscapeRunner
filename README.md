# 🚀 Space Escape Runner

A fast-paced, hyper-casual space dodging game built with React Native and Expo!

## 🎮 How to Play
- **Objective:** Survive as long as possible by dodging the falling asteroids.
- **Controls:** Tap the **LEFT** and **RIGHT** buttons at the bottom of the screen to smoothly glide your spaceship out of danger.
- **Scoring:** Every time an asteroid safely passes you, you earn a point. Your High Score is automatically saved!

## 📥 Download the Game (Android APK)
You can download and install this game directly on your Android device!
1. **[Click here to view the Expo Dashboard](https://expo.dev/accounts/anand101/projects/SpaceEscapeRunner)**.
2. Find the latest successful Android build and click **Download**.
3. Transfer the `.apk` file to your phone (or download it directly on your phone).
4. Tap the file to install the game. *(Note: You may need to allow "Install from Unknown Sources" in your Android settings).*

## 🛠️ Local Development

### Requirements
- Node.js (v18+)
- npm

### Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npx expo start
   ```
3. Press `a` to open on an Android emulator, `i` for iOS simulator, or scan the QR code with the Expo Go app on your physical device.

## 📦 Building the App (EAS)
This project is configured to use Expo Application Services (EAS). 

**To build a new standalone APK:**
```bash
eas build -p android --profile preview
```

**To build an AAB for the Google Play Store:**
```bash
eas build -p android --profile production
```
