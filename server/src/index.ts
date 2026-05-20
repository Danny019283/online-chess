import 'reflect-metadata';
import app from './app';
import { AppDataSource } from './database/connection';
import { gameStateManager } from './services/gameStateManager';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    setInterval(() => {
      const expired = gameStateManager.cleanupOldGames();
      if (expired.length > 0) {
        console.log(`Cleaned up ${expired.length} expired games:`, expired);
      }
    }, 60 * 1000);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
