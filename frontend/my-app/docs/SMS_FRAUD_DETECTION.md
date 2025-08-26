# SMS Fraud Detection System Documentation

## Overview

The Fraud Shield SMS verification system uses a multi-layered approach to detect potentially fraudulent SMS messages:

1. **AI-powered Analysis**: Using OpenAI's API to perform advanced text analysis
2. **Pattern Matching**: Detecting known fraud patterns and suspicious language
3. **Fallback Mechanisms**: Local detection when API access is unavailable

## Features

- Real-time fraud detection for incoming SMS messages
- Detailed analysis of message content with confidence scoring
- Human-readable explanations of why a message was flagged
- Fallback mechanisms for offline or API failure scenarios
- Extensive pattern library covering common fraud schemes

## Integration

The system is integrated with the SMS monitoring service and provides:

- Fraud classification (FRAUD, LEGITIMATE, NORMAL_SMS)
- Confidence scores (0-100)
- Human-readable explanations
- Pattern matching details

## Technical Implementation

### Files

- `utils/smsAnalyzer.ts` - Primary SMS analysis module using OpenAI
- `utils/localDetection.ts` - Fallback detection without external APIs
- `services/smsMonitor.ts` - Integration with the monitoring service
- `.env.local` - Environment configuration (OpenAI API key)

### Analysis Process

1. An incoming SMS is received by the monitoring service
2. The message is passed to `analyzeMessage()` along with the sender
3. The analyzer attempts AI-powered detection using OpenAI
4. If successful, the result is returned with a classification and explanation
5. If the API call fails, the system falls back to pattern-based analysis
6. Results are displayed to the user in the monitoring interface

### Adding Your API Key

To use the OpenAI integration:

1. Get an API key from [OpenAI](https://openai.com/api/)
2. Add it to the `.env.local` file: `OPENAI_API_KEY=your-api-key-here`
3. Restart the application

### Fraud Patterns

The system checks for numerous fraud indicators including:

- Urgent action requests
- Financial terminology
- Personal information requests
- Prize and lottery scams
- Suspicious URLs
- Account security issues
- Cryptocurrency terminology
- Tax and government scams
- Shipping notification scams
- Investment schemes
- Job scams
- Success story patterns

Each pattern is weighted according to its likelihood of indicating fraud, with combinations of patterns triggering higher risk scores.

## Usage

The system automatically analyzes incoming SMS messages when monitoring is active. Results are displayed in the monitoring interface, including:

- Fraud status (safe/fraud)
- Confidence level
- Explanation of why a message was flagged
- Pattern matches (for advanced users)

## Privacy & Security

- All message analysis happens on-device or via secure API calls
- No message content is stored externally
- OpenAI API calls use standard security protocols
- The system works offline with reduced accuracy when API access is unavailable

## Limitations

- The system is not 100% accurate and should be used as a tool, not a guarantee
- Some legitimate messages may be flagged (false positives)
- Some fraudulent messages may be missed (false negatives)
- AI analysis requires an internet connection and valid API key

## Future Improvements

- Additional language support
- User feedback loop to improve detection accuracy
- Custom pattern definitions for specific fraud types
- Regional fraud pattern specialization
