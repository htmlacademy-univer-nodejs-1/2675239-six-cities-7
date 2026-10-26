import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';
import { TYPES } from '../const/tokens.js';
import { LoggerService } from './logger.service.js';

@injectable()
export class DatabaseService {
  constructor(@inject(TYPES.Logger) private readonly logger: LoggerService) {}

  public async connect(databaseUrl: string): Promise<void> {
    this.logger.info('Attempting to connect to MongoDB');
    try {
      await mongoose.connect(databaseUrl);
      this.logger.info('Connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    this.logger.info('Disconnected from MongoDB');
  }
}
