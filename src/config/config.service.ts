import convict from 'convict';
import convictFormats from 'convict-format-with-validator';
import dotenv from 'dotenv';
import { injectable } from 'inversify';

convict.addFormats(convictFormats);
convict.addFormat({
  name: 'non-empty-string',
  validate: (value: unknown) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('must be a non-empty string');
    }
  },
});

export interface AppConfig {
  port: number;
  databaseHost: string;
  databaseUrl: string;
  salt: string;
}

const configSchema: convict.Schema<AppConfig> = {
  port: {
    doc: 'Port where the application accepts connections',
    format: 'port',
    default: null,
    env: 'PORT',
  },
  databaseHost: {
    doc: 'Database server IP address',
    format: 'ipaddress',
    default: null,
    env: 'DB_HOST',
  },
  databaseUrl: {
    doc: 'MongoDB connection URL',
    format: String,
    default: 'mongodb://admin:test@127.0.0.1:27017/six-cities?authSource=admin',
    env: 'MONGO_URL',
  },
  salt: {
    doc: 'Random string used as a salt',
    format: 'non-empty-string',
    default: null,
    env: 'SALT',
    sensitive: true,
  },
};

@injectable()
export class ConfigService {
  private readonly config: convict.Config<AppConfig>;

  constructor() {
    dotenv.config({ quiet: true });
    this.config = convict<AppConfig>(configSchema);
    this.config.validate({ allowed: 'strict' });
  }

  public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config.get(key) as AppConfig[K];
  }
}
