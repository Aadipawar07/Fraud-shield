# Backend Deployment for Fraud Shield

This guide explains how to deploy the Fraud Shield backend to make it accessible to your APK users from anywhere.

## Option 1: Deploying to Render (Recommended for Simplicity)

1. Create an account on [Render.com](https://render.com/)

2. Create a new Web Service:
   - Connect your GitHub repository
   - Or use Render's direct deployment from your local files

3. Configure the service:
   - Name: fraud-shield-backend
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Add environment variables (copy from your .env file)

4. Deploy and get your URL (will look like `https://fraud-shield-backend.onrender.com`)

## Option 2: Deploying to Heroku

1. Create a `Procfile` in your backend directory with:
   ```
   web: node index.js
   ```

2. Deploy using Heroku CLI:
   ```bash
   heroku login
   heroku create fraud-shield-api
   git subtree push --prefix backend heroku main
   ```

3. Set environment variables:
   ```bash
   heroku config:set HF_API_KEY=your_api_key
   # Add other environment variables from your .env file
   ```

## Update Frontend to Use Deployed Backend

Once deployed, update these files in your frontend code before building the APK:

1. In `services/api.ts`:
   - Change the `getApiBaseUrl` function to return your deployed URL
   - Or set `EXPO_PUBLIC_API_URL` in your environment or in app.json

2. In `services/auth.ts`:
   - Update `API_URL` to match your deployed backend URL

## Database Setup

If using PostgreSQL, you'll need to provision a database:

1. For Render: Add a PostgreSQL service
2. For Heroku: `heroku addons:create heroku-postgresql:mini`

Then update your backend connection string to use the provided database URL.

## Final Checks Before APK Distribution

- Test your deployed backend with `curl` or Postman
- Make a test build of your APK pointing to the deployed backend
- Verify SMS monitoring works with the remote backend
