# AI Fraud Detection Integration Guide

This document provides a guide on how to set up the AI-powered fraud detection functionality in the Fraud-Shield app.

## Setup Instructions

### 1. OpenAI API Key

The app uses OpenAI's GPT models for advanced fraud detection. To enable this feature:

1. Get an API key from [OpenAI's platform](https://platform.openai.com/)
2. Create a `.env` file in the `frontend/my-app` directory
3. Add your API key to the `.env` file:

```
OPENAI_API_KEY=sk-your-api-key-here
```

4. Restart the app

### 2. Understanding Fallback Detection

If the OpenAI API is unavailable for any reason (no API key, network issues, etc.), the app will automatically fall back to a local pattern-based detection system. This ensures the app remains functional even without API access.

The fallback detection will show a notice in the UI when it's being used.

### 3. Testing Both Approaches

- **With API Key**: The app will use OpenAI's advanced analysis
- **Without API Key**: The app will use local pattern detection

## Technical Implementation

The fraud detection is implemented in two layers:

1. **Primary**: OpenAI GPT-based analysis (`utils/fraudDetection.ts`)
2. **Fallback**: Local pattern-based detection (`utils/localDetection.ts`)

The implementation handles:
- API connection failures
- Rate limits
- Authentication issues
- Browser compatibility issues
- JSON parsing errors

## Usage

The fraud detection can be accessed from:

1. **Scan Tab**: General-purpose fraud scanning
2. **OpenAI Tab**: Direct demonstration of the AI integration with more detailed output

Each provides slightly different UI but uses the same underlying detection engine.

## Security Considerations

Never commit your API key to version control. The `.env` file is added to `.gitignore` to prevent this.
