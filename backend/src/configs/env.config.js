import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/aquacraft',
  JWT_SECRET: process.env.JWT_SECRET || 'aquacraft_super_secret_key_123',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  BANK_BIN: process.env.BANK_BIN || '970436',
  BANK_NAME: process.env.BANK_NAME || 'Vietcombank',
  BANK_ACCOUNT_NUMBER: process.env.BANK_ACCOUNT_NUMBER || '1033805613',
  BANK_ACCOUNT_NAME: process.env.BANK_ACCOUNT_NAME || 'NGUYEN THI THANH THU',
};

