import 'reflect-metadata';
import { Container } from 'inversify';
import { Application } from './application.js';
import { ConfigService } from './config/config.service.js';
import { TYPES } from './const/tokens.js';
import { LoggerService } from './service/logger.service.js';

const container = new Container();

container.bind<Application>(TYPES.Application).to(Application).inSingletonScope();
container.bind<LoggerService>(TYPES.Logger).to(LoggerService).inSingletonScope();
container.bind<ConfigService>(TYPES.Config).to(ConfigService).inSingletonScope();

export { container };
