import { registerAs } from '@nestjs/config';

export default registerAs('logging', () => ({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'silly'),
  dir: process.env.LOG_DIR || 'logs',
  appName: process.env.APP_NAME || 'MyApp',
}));