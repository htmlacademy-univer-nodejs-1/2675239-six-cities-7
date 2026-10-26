#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

const DEFAULT_MOCK_PATH = resolve(process.cwd(), 'mocks/mock.tsv');
const HELP_TEXT = '\u041f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0430 \u0434\u043b\u044f \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0438 \u0434\u0430\u043d\u043d\u044b\u0445 \u0441\u0435\u0440\u0432\u0438\u0441\u0430 \u00ab\u0428\u0435\u0441\u0442\u044c \u0433\u043e\u0440\u043e\u0434\u043e\u0432\u00bb.\n\n\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 \u043a\u043e\u043c\u0430\u043d\u0434\u044b:\n  --help           \u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u044d\u0442\u0443 \u0441\u043f\u0440\u0430\u0432\u043a\u0443\n  --version        \u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0435\u0440\u0441\u0438\u044e \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u044f\n  --import [\u043f\u0443\u0442\u044c]  \u0418\u043c\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u044f \u0438\u0437 TSV-\u0444\u0430\u0439\u043b\u0430';

const printHelp = (): void => console.log(chalk.cyan(HELP_TEXT));

const printVersion = async (): Promise<void> => {
  const packageJsonPath = new URL('../package.json', import.meta.url);
  const packageInfo = JSON.parse(await readFile(packageJsonPath, 'utf8')) as { version: string };
  console.log(chalk.green(packageInfo.version));
};

const importOffers = async (filePath: string): Promise<void> => {
  try {
    const content = (await readFile(filePath, 'utf8')).replace(/^\uFEFF/, '');
    const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
    if (lines.length === 0) {
      console.log(chalk.yellow('\u0424\u0430\u0439\u043b \u043d\u0435 \u0441\u043e\u0434\u0435\u0440\u0436\u0438\u0442 \u0434\u0430\u043d\u043d\u044b\u0445.'));
      return;
    }
    lines.forEach((line, index) => {
      console.log(chalk.gray(`\u041f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u0435 ${index + 1}:`));
      console.log(line.split('\t').join('\n'));
    });
    console.log(chalk.green(`\u0418\u043c\u043f\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u043e \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0435\u043d\u0438\u0439: ${lines.length}`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`\u041e\u0448\u0438\u0431\u043a\u0430 \u0438\u043c\u043f\u043e\u0440\u0442\u0430: ${message}`));
    process.exitCode = 1;
  }
};

const run = async (args: string[]): Promise<void> => {
  const [command, ...parameters] = args;
  switch (command) {
    case undefined:
    case '--help':
      printHelp();
      break;
    case '--version':
      await printVersion();
      break;
    case '--import':
      await importOffers(parameters[0] ? resolve(parameters[0]) : DEFAULT_MOCK_PATH);
      break;
    default:
      console.error(chalk.red(`\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u0430\u044f \u043a\u043e\u043c\u0430\u043d\u0434\u0430: ${command}`));
      printHelp();
      process.exitCode = 1;
  }
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await run(process.argv.slice(2));
}
