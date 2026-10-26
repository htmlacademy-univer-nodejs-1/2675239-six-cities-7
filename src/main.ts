#!/usr/bin/env node
import 'reflect-metadata';
import axios from 'axios';
import { Application } from './application.js';
import { container } from './container.js';
import { TYPES } from './const/tokens.js';
import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import chalk from 'chalk';
import type { OfferSeed } from './types/offer.js';
import { OfferImportService } from './service/offer-import.service.js';
import { ConfigService } from './config/config.service.js';

const HELP_TEXT = '\u041f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0430 \u0434\u043b\u044f \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0438 \u0434\u0430\u043d\u043d\u044b\u0445 \u0441\u0435\u0440\u0432\u0438\u0441\u0430 \u00ab\u0428\u0435\u0441\u0442\u044c \u0433\u043e\u0440\u043e\u0434\u043e\u0432\u00bb.\n\n\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 \u043a\u043e\u043c\u0430\u043d\u0434\u044b:\n  --help                         \u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u044d\u0442\u0443 \u0441\u043f\u0440\u0430\u0432\u043a\u0443\n  --version                      \u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0435\u0440\u0441\u0438\u044e \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f\n  --import <filepath> [mongodb-url]  \u0418\u043c\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c TSV-\u0444\u0430\u0439\u043b \u0432 MongoDB\n  --generate <n> <filepath> <url>  \u0421\u0433\u0435\u043d\u0435\u0440\u0438\u0440\u043e\u0432\u0430\u0442\u044c TSV-\u0444\u0430\u0439\u043b';

const printHelp = (): void => console.log(chalk.cyan(HELP_TEXT));

const printVersion = async (): Promise<void> => {
  const packageJsonPath = new URL('../package.json', import.meta.url);
  const packageInfo = JSON.parse(await readFile(packageJsonPath, 'utf8')) as { version: string };
  console.log(chalk.green(packageInfo.version));
};

const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

interface OfferPool {
  titles: string[];
  descriptions: string[];
  publicationDates: string[];
  cities: OfferSeed['city'][];
  previewImages: string[];
  images: string[][];
  premiums: boolean[];
  types: OfferSeed['type'][];
  rooms: number[];
  guests: number[];
  prices: number[];
  goods: string[][];
  authors: OfferSeed['author'][];
}

const createOfferPool = (offers: OfferSeed[]): OfferPool => ({
  titles: offers.map((offer) => offer.title),
  descriptions: offers.map((offer) => offer.description),
  publicationDates: offers.map((offer) => offer.publicationDate),
  cities: offers.map((offer) => offer.city),
  previewImages: offers.map((offer) => offer.previewImage),
  images: offers.map((offer) => offer.images),
  premiums: offers.map((offer) => offer.isPremium),
  types: offers.map((offer) => offer.type),
  rooms: offers.map((offer) => offer.rooms),
  guests: offers.map((offer) => offer.guests),
  prices: offers.map((offer) => offer.price),
  goods: offers.map((offer) => offer.goods),
  authors: offers.map((offer) => offer.author),
});

const createTsvOffer = (pool: OfferPool): string => {
  const author = randomItem(pool.authors);
  const fields: Array<string | number | boolean> = [
    randomItem(pool.titles),
    randomItem(pool.descriptions),
    randomItem(pool.publicationDates),
    randomItem(pool.cities),
    randomItem(pool.previewImages),
    randomItem(pool.images).join(','),
    randomItem(pool.premiums),
    randomItem(pool.types),
    randomItem(pool.rooms),
    randomItem(pool.guests),
    randomItem(pool.prices),
    randomItem(pool.goods).join(','),
    author.name,
    author.email,
    author.avatarUrl,
    author.password,
    author.type,
  ];
  return fields.map(String).join('\t');
};

async function* generateRows(count: number, pool: OfferPool): AsyncGenerator<string> {
  const chunkSize = 256;
  let rows: string[] = [];
  for (let index = 0; index < count; index += 1) {
    rows.push(`${createTsvOffer(pool)}\n`);
    if (rows.length === chunkSize) {
      yield rows.join('');
      rows = [];
    }
  }
  if (rows.length > 0) {
    yield rows.join('');
  }
}
const generateOffers = async (countValue: string, filePath: string, url: string): Promise<void> => {
  const count = Number(countValue);
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new Error('The number of offers must be a positive safe integer.');
  }
  if (!filePath || !url) {
    throw new Error('Usage: --generate <n> <filepath> <url>');
  }

  const { data } = await axios.get<OfferSeed[]>(url);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('The JSON service must return a non-empty array of offer templates.');
  }

  await pipeline(
    Readable.from(generateRows(count, createOfferPool(data))),
    createWriteStream(resolve(filePath), { encoding: 'utf8' }),
  );
  console.log(chalk.green(`Generated ${count} offers in ${resolve(filePath)}`));
};

const run = async (args: string[]): Promise<void> => {
  const [command, ...parameters] = args;
  try {
    switch (command) {
      case undefined:
      case '--help':
        printHelp();
        break;
      case '--version':
        await printVersion();
        break;
      case '--import':
        if (!parameters[0]) {
          throw new Error('Usage: --import <filepath> [mongodb-url]');
        }
        {
          const config = container.get<ConfigService>(TYPES.Config);
          const importer = container.get<OfferImportService>(TYPES.OfferImportService);
          const count = await importer.import(resolve(parameters[0]), parameters[1] ?? config.get('databaseUrl'));
          console.log(chalk.green(`Imported offers: ${count}`));
        }
        break;
      case '--generate':
        await generateOffers(parameters[0], parameters[1], parameters[2]);
        break;
      default:
        console.error(chalk.red(`Unknown command: ${command}`));
        printHelp();
        process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(message));
    process.exitCode = 1;
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const application = container.get<Application>(TYPES.Application);
  application.init();
  await run(process.argv.slice(2));
}
