import 'reflect-metadata';
import { Container } from 'inversify';
import { Application } from './application.js';
import { ConfigService } from './config/config.service.js';
import { TYPES } from './const/tokens.js';
import { LoggerService } from './service/logger.service.js';
import { DatabaseService } from './service/database.service.js';
import { UserService } from './service/user.service.js';
import { OfferService } from './service/offer.service.js';
import { OfferImportService } from './service/offer-import.service.js';

const container = new Container();

container.bind<Application>(TYPES.Application).to(Application).inSingletonScope();
container.bind<LoggerService>(TYPES.Logger).to(LoggerService).inSingletonScope();
container.bind<ConfigService>(TYPES.Config).to(ConfigService).inSingletonScope();
container.bind<DatabaseService>(TYPES.Database).to(DatabaseService).inSingletonScope();
container.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
container.bind<OfferService>(TYPES.OfferService).to(OfferService).inSingletonScope();
container.bind<OfferImportService>(TYPES.OfferImportService).to(OfferImportService).inSingletonScope();

export { container };
