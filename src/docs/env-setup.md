# Environment Variables Setup

This document explains the environment variables needed for the Business Assistant application.

## DeepSeek API Integration

To use the DeepSeek AI features, you need to set up the following environment variable in your `.env.local` file:

```
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
```

Replace `your_deepseek_api_key` with your actual DeepSeek API key.

## How to Get a DeepSeek API Key

1. Sign up for an account at [DeepSeek's website](https://deepseek.com)
2. Navigate to the API section in your account dashboard
3. Create a new API key
4. Copy the API key and add it to your `.env.local` file

## Security Considerations

- Never commit your `.env.local` file to version control
- Use environment variables for all sensitive information
- For production, consider using a secret management service

## Other Environment Variables

The application also requires the following environment variables for authentication:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AUTH_SECRET=your_auth_secret
```

These are used for the Next.js Auth integration.
