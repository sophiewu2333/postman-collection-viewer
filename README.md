# Postman Collection Viewer

A React application for viewing Postman collections and converting them to OpenAPI specifications.

## Requirements

- Node.js >= 14.0.0
- npm >= 6.0.0

## Installation and Setup

### Initial Setup

1. Clone the repository
```bash
git clone <repository-url>
cd postman-collection-viewer
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
   
   The project root contains a `.env.example` file as a configuration template. Follow these steps to configure:
   
   ```bash
   # Copy the configuration template
   cp .env.example .env
   
   # Edit the .env file and enter your API key
   # Or manually create the .env file:
   ```
   
   ```bash
   # Postman API Configuration
   REACT_APP_POSTMAN_API_KEY=your_postman_api_key_here
   ```
   
   **Get Postman API Key:**
   - Log in to [Postman](https://www.postman.com/)
   - Go to [API Keys page](https://go.postman.co/settings/me/api-keys)
   - Create a new API key or use an existing one
   - Copy the key to the `.env` file

4. Start the development server
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

### Environment Variables

⚠️ **Important:** Make sure to properly configure `REACT_APP_POSTMAN_API_KEY` in the `.env` file before starting the application. If not configured or configured incorrectly, the application will not work properly.

### Troubleshooting

If you encounter "react-scripts command not found" error:

1. Make sure dependencies are installed:
```bash
npm install
```

2. Check if react-scripts is properly installed:
```bash
npm list react-scripts
```

3. If the problem persists, try clearing the cache:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

If you encounter "Postman API key is not configured" error:

1. Make sure the `.env` file is created:
```bash
cp .env.example .env
```

2. Check if the API key in the `.env` file is properly configured:
```bash
cat .env
```

3. Make sure the API key format is correct (starts with `PMAK-`)

4. Restart the development server:
```bash
npm start
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject configuration (irreversible)

## Tech Stack

- React 19.1.1
- TypeScript 4.9.5
- react-scripts 5.0.1
