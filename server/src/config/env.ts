import dotenv from 'dotenv';

dotenv.config();

const raw = (k: string) => process.env[k] ?? '';

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/truetaste',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  },
  stt: {
    apiKey: process.env.STT_API_KEY || '',
    baseUrl: process.env.STT_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.STT_MODEL || 'whisper-1',
  },
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:8081',
};

type Missing = { key: string; hint: string };

export function checkEnv(): Missing[] {
  const missing: Missing[] = [];

  if (!raw('MONGODB_URI')) {
    missing.push({
      key: 'MONGODB_URI',
      hint: 'Add MONGODB_URI to server/.env, e.g. MONGODB_URI=mongodb://127.0.0.1:27017/truetaste',
    });
  }
  if (!raw('JWT_SECRET')) {
    missing.push({
      key: 'JWT_SECRET',
      hint: 'Add a JWT_SECRET to server/.env in production (default "dev-secret-change-me" is insecure).',
    });
  }
  if (!raw('STT_API_KEY')) {
    missing.push({
      key: 'STT_API_KEY',
      hint: 'Optional: add a Groq key so voice reviews transcribe (without it, voice reviews are stored as plain text).',
    });
  }
  if (!raw('AI_API_KEY')) {
    missing.push({
      key: 'AI_API_KEY',
      hint: 'Optional: add an AI key for live summaries. Without it, the mock summary fallback is used.',
    });
  }

  return missing;
}