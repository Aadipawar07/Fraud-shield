// Script to fix common build errors
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Running build error fix script...');

// Function to ensure a directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Fix missing node modules
try {
  console.log('Checking for missing node modules...');
  execSync('npm list expo-task-manager expo-background-fetch react-native-android-sms-listener || npm install expo-task-manager expo-background-fetch react-native-android-sms-listener --save', {
    stdio: 'inherit'
  });
} catch (error) {
  // If we get a non-zero exit code from npm list, install the modules
  console.log('Installing required modules...');
  execSync('npm install expo-task-manager expo-background-fetch react-native-android-sms-listener --save', {
    stdio: 'inherit'
  });
}

// Fix missing directories
ensureDirectoryExists(path.join(__dirname, '../android/app/src/main/assets'));

// Clear metro bundler cache
try {
  console.log('Clearing Metro bundler cache...');
  const metroDir = path.join(__dirname, '../node_modules/.cache/metro');
  if (fs.existsSync(metroDir)) {
    fs.rmdirSync(metroDir, { recursive: true });
    console.log('Metro cache cleared');
  }
} catch (error) {
  console.error('Error clearing Metro cache:', error);
}

// Fix permissions issues in Android Gradle files
try {
  console.log('Fixing Android Gradle file permissions...');
  const gradlewPath = path.join(__dirname, '../android/gradlew');
  if (fs.existsSync(gradlewPath)) {
    fs.chmodSync(gradlewPath, 0o755);
    console.log('Fixed gradlew permissions');
  }
} catch (error) {
  console.error('Error fixing gradlew permissions:', error);
}

// Update expo plugins config to ensure task manager is registered
try {
  console.log('Updating app.json configuration...');
  const appJsonPath = path.join(__dirname, '../app.json');
  if (fs.existsSync(appJsonPath)) {
    const appJson = require(appJsonPath);
    
    // Ensure plugins array exists
    if (!appJson.expo.plugins) {
      appJson.expo.plugins = [];
    }
    
    // Check if task-manager plugin is in the array
    let hasTaskManager = false;
    for (const plugin of appJson.expo.plugins) {
      if ((typeof plugin === 'string' && plugin === 'expo-task-manager') ||
          (Array.isArray(plugin) && plugin[0] === 'expo-task-manager')) {
        hasTaskManager = true;
        break;
      }
    }
    
    if (!hasTaskManager) {
      appJson.expo.plugins.push('expo-task-manager');
    }
    
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    console.log('Updated app.json configuration');
  }
} catch (error) {
  console.error('Error updating app.json:', error);
}

console.log('Build error fix script completed!');
console.log('You can now try running "npx eas build --platform android --profile preview" again.');
