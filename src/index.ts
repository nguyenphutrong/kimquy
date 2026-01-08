#!/usr/bin/env bun

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInitCommand } from './cli/commands/init.ts';
import { createUseCommand } from './cli/commands/use.ts';
import { createProfileCommand } from './cli/commands/profile.ts';
import { createScanCommand } from './cli/commands/scan.ts';
import { createSkillCommand } from './cli/commands/skill.ts';
import { createAdaptCommand } from './cli/commands/adapt.ts';
import { createStatusCommand } from './cli/commands/status.ts';
import { createDoctorCommand } from './cli/commands/doctor.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PackageJson {
  version: string;
  description: string;
}

function getPackageJson(): PackageJson {
  const paths = [
    join(__dirname, '../package.json'),
    join(__dirname, '../../package.json'),
    join(process.cwd(), 'package.json'),
  ];

  for (const path of paths) {
    try {
      const content = readFileSync(path, 'utf-8');
      return JSON.parse(content) as PackageJson;
    } catch {}
  }

  return { version: '0.1.0', description: 'Kim Quy CLI' };
}

const pkg = getPackageJson();

const program = new Command();

program
  .name('kq')
  .description(pkg.description)
  .version(pkg.version, '-V, --version', 'Display version number')
  .helpOption('-h, --help', 'Display help information')
  .showHelpAfterError('(add --help for additional information)')
  .configureOutput({
    outputError: (str, write) => write(`\x1b[31m${str}\x1b[0m`),
  });

program.addCommand(createInitCommand());
program.addCommand(createUseCommand());
program.addCommand(createProfileCommand());
program.addCommand(createScanCommand());
program.addCommand(createSkillCommand());
program.addCommand(createAdaptCommand());
program.addCommand(createStatusCommand());
program.addCommand(createDoctorCommand());

try {
  program.parse(process.argv);
} catch (error) {
  if (error instanceof Error) {
    console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
  }
  process.exit(1);
}
