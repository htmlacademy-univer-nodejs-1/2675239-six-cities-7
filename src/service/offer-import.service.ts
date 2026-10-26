import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { injectable } from 'inversify';
import { TYPES } from '../const/tokens.js';
import type { City, Goods, OfferType, UserType } from '../types/offer.js';
import { DatabaseService } from './database.service.js';
import { LoggerService } from './logger.service.js';
import { OfferService } from './offer.service.js';
import { UserService } from './user.service.js';
import { inject } from 'inversify';

@injectable()
export class OfferImportService {
  constructor(
    @inject(TYPES.Database) private readonly database: DatabaseService,
    @inject(TYPES.UserService) private readonly userService: UserService,
    @inject(TYPES.OfferService) private readonly offerService: OfferService,
    @inject(TYPES.Logger) private readonly logger: LoggerService,
  ) {}

  public async import(filePath: string, databaseUrl: string): Promise<number> {
    await this.database.connect(databaseUrl);
    const input = createReadStream(filePath, { encoding: 'utf8' });
    const lines = createInterface({ input, crlfDelay: Infinity });
    let count = 0;

    try {
      for await (const rawLine of lines) {
        if (!rawLine) {
          continue;
        }
        const line = count === 0 ? rawLine.replace(/^\uFEFF/, '') : rawLine;
        const columns = line.split('\t');
        if (columns.length !== 17) {
          throw new Error(`Invalid TSV row ${count + 1}: expected 17 columns, received ${columns.length}.`);
        }

        const [title, description, publicationDate, city, previewImage, images, isPremium, type,
          rooms, guests, price, goods, name, email, avatarUrl, password, userType] = columns;

        const existingUser = await this.userService.findByEmail(email);
        const user = existingUser ?? await this.userService.create({
          name,
          email,
          avatarUrl,
          password,
          type: userType as UserType,
        });

        await this.offerService.create({
          title,
          description,
          publicationDate: new Date(publicationDate),
          city: city as City,
          previewImage,
          images: images ? images.split(',') : [],
          isPremium: isPremium === 'true',
          type: type as OfferType,
          rooms: Number(rooms),
          guests: Number(guests),
          price: Number(price),
          goods: (goods ? goods.split(',') : []) as Goods[],
          author: user._id,
        });
        count += 1;
      }
      this.logger.info('Offers imported to MongoDB', { count });
      return count;
    } finally {
      lines.close();
      input.destroy();
      await this.database.disconnect();
    }
  }
}
