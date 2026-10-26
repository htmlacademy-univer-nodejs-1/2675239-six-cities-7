import pino from 'pino';
import { injectable } from 'inversify';

@injectable()
export class LoggerService {
  private readonly logger = pino();

  public info(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.logger.info(context, message);
      return;
    }
    this.logger.info(message);
  }

  public error(message: string, context?: Record<string, unknown>): void {
    if (context) {
      this.logger.error(context, message);
      return;
    }
    this.logger.error(message);
  }
}
