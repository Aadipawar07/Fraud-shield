// Script to prepare SMS monitoring build environment
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Preparing SMS monitoring build environment...');

// Copy production version of backgroundMonitoring.ts
try {
  const prodPath = path.join(__dirname, '../services/backgroundMonitoring.prod.ts');
  const targetPath = path.join(__dirname, '../services/backgroundMonitoring.ts');
  
  if (fs.existsSync(prodPath)) {
    fs.copyFileSync(prodPath, targetPath);
    console.log('✅ Copied production backgroundMonitoring.ts file');
  } else {
    console.error('❌ Production backgroundMonitoring.prod.ts file not found');
  }
} catch (error) {
  console.error('Error copying backgroundMonitoring.ts:', error);
}

// Install required dependencies
console.log('Installing required dependencies...');
try {
  execSync('npm install expo-task-manager expo-background-fetch react-native-android-sms-listener --save', {
    stdio: 'inherit'
  });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Error installing dependencies:', error);
}

// Update package.json with SMS monitoring version
try {
  const smsMonitoringPackagePath = path.join(__dirname, '../package.json.sms-monitoring');
  const packageJsonPath = path.join(__dirname, '../package.json');
  
  if (fs.existsSync(smsMonitoringPackagePath)) {
    fs.copyFileSync(smsMonitoringPackagePath, packageJsonPath);
    console.log('✅ Updated package.json with SMS monitoring dependencies');
  } else {
    console.error('❌ SMS monitoring package.json template not found');
  }
} catch (error) {
  console.error('Error updating package.json:', error);
}

console.log('SMS monitoring build environment preparation complete!');
console.log('Run "npx eas build --platform android --profile preview" to build the APK');
