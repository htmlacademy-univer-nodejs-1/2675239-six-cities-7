import { inject, injectable } from 'inversify';
import { TYPES } from './const/tokens.js';
import { ConfigService } from './config/config.service.js';
import { LoggerService } from './service/logger.service.js';

@injectable()
export class Application {
  constructor(
    @inject(TYPES.Logger) private readonly logger: LoggerService,
    @inject(TYPES.Config) private readonly config: ConfigService,
  ) {}

  public init(): void {
    this.logger.info('Application is initialized', { port: this.config.get('port') });
  }
}
