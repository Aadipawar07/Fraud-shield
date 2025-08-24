# 🛡️ Fraud Shield - SMS Fraud Detection App

A comprehensive fraud detection application that analyzes SMS messages for potential scams and fraudulent content using AI and rule-based detection.

## 🚀 Features

- **Real-time SMS Analysis**: Instant fraud detection for SMS messages
- **AI-Powered Detection**: Uses HuggingFace ML models for accurate spam detection
- **Fallback System**: Rule-based detection when AI is unavailable
- **Cross-Platform**: Works on iOS, Android, and Web
- **Modern UI**: Built with React Native and Expo

## 📁 Project Structure

```
Fraud-Shield/
├── backend/                 # Express.js API server
│   ├── index.js            # Main server file
│   ├── token.env           # HuggingFace API token
│   └── data/               # Data files
├── frontend/my-app/        # React Native Expo app
│   ├── app/                # App screens and routing
│   ├── components/         # Reusable components
│   ├── services/           # API services
│   └── assets/             # Images and icons
└── start-app.ps1           # Quick start script
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- HuggingFace API token (get from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Aadipawar07/Fraud-shield-.git
   cd Fraud-Shield
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend/my-app
   npm install
   cd ../..
   ```

3. **Configure API Token**
   - Edit `backend/token.env`
   - Replace `your_huggingface_token_here` with your actual HuggingFace API token

### 🚀 Running the Application

#### Option 1: Quick Start (PowerShell)

```powershell
.\start-app.ps1
```

#### Option 2: Manual Start

**Terminal 1 - Backend:**

```bash
cd Fraud-Shield
npm run backend
```

**Terminal 2 - Frontend:**

```bash
cd Fraud-Shield/frontend/my-app
npm start
```

### 📱 Accessing the App

- **Web**: http://localhost:8081
- **Mobile**: Scan QR code with Expo Go app
- **Backend API**: http://localhost:5000

## 🧪 Testing the API

### Test Fraud Detection

```bash
curl -X POST http://localhost:5000/fraud-check \
  -H "Content-Type: application/json" \
  -d '{"message": "Congratulations! You won $1000! Click here to claim now!"}'
```

### Test Safe Message

```bash
curl -X POST http://localhost:5000/fraud-check \
  -H "Content-Type: application/json" \
  -d '{"message": "Hi, how are you doing today?"}'
```

## 📱 App Usage

1. **Home Screen**: Overview and quick access to all features
2. **Scan Screen**: Enter SMS text to check for fraud
3. **Monitor Screen**: View SMS monitoring dashboard (coming soon)
4. **Report Screen**: Submit fraud reports (coming soon)
5. **Verify Screen**: Verify sender authenticity (coming soon)

## 🔧 API Endpoints

### POST /fraud-check

Analyze SMS message for fraud indicators

**Request:**

```json
{
  "message": "Your SMS text here"
}
```

**Response:**

```json
{
  "fraud": false,
  "confidence": 0.95,
  "reason": "AI analysis indicates message is safe",
  "method": "AI",
  "timestamp": "2025-08-18T13:30:00.000Z"
}
```

## 🛡️ Detection Methods

1. **AI Detection**: Uses HuggingFace BERT model for accurate spam classification
2. **Rule-based Fallback**: Keyword-based detection when AI is unavailable

## 🔍 Fraud Indicators

The app detects common fraud patterns:

- Prize/lottery scams
- Urgent action required
- Suspicious links
- Account verification requests
- Financial promises

## 🐛 Troubleshooting

### Backend Issues

- Ensure Node.js is installed
- Check HuggingFace API token in `backend/token.env`
- Verify port 5000 is not in use

### Frontend Issues

- Install Expo CLI: `npm install -g @expo/cli`
- Clear cache: `npx expo start --clear`
- Check network connectivity

### API Connection Issues

- Ensure backend is running on port 5000
- Check firewall settings
- Verify CORS configuration

## 📄 License

ISC License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for safer digital communication**
