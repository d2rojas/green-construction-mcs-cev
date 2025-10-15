# Backend Setup Instructions

## Environment Configuration

### 1. Create Environment File
Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### 2. Configure OpenAI API Key
Edit the `.env` file and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 3. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

### 4. Other Configuration (Optional)
You can also configure:
- `PORT`: Server port (default: 3002)
- `NODE_ENV`: Environment (development/production)

## Security Notes

- **Never commit the `.env` file** to version control
- The `.env` file is already included in `.gitignore`
- Use different API keys for development and production
- Rotate your API keys regularly

## Running the Backend

```bash
npm install
npm start
```

The backend will start on port 3002 by default.

## Troubleshooting

### "OPENAI_API_KEY environment variable is not set!"
- Make sure you have created a `.env` file
- Verify the API key is correctly set in the `.env` file
- Restart the server after making changes

### API Key Invalid
- Check that your OpenAI API key is valid
- Ensure you have sufficient credits in your OpenAI account
- Verify the key format (should start with `sk-`)
