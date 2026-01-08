import { Command } from 'commander';
import { logger } from '../../utils/logger.ts';
import {
  fileExists,
  ensureDir,
  writeTextFile,
  writeJson,
  getKimQuyDir,
  getConfigPath,
  CONFIG_FILE_NAME,
} from '../../utils/fs.ts';

interface InitOptions {
  profile: string;
  force: boolean;
}

function generateConfigContent(profileName: string): string {
  return `/** @type {import('kimquy').UserConfig} */
export default {
  profiles: {
    ${profileName}: {
      name: '${profileName.charAt(0).toUpperCase() + profileName.slice(1)} Profile',
      description: 'AI context profile for ${profileName}',
      skillDirs: ['./skills'],
    },
  },
  defaultProfile: '${profileName}',
  skillPatterns: ['**/SKILL.md', '**/*.skill.md'],
};
`;
}

interface InitialState {
  currentProfile: string | null;
  lastScanAt: string | null;
  version: string;
}

function generateInitialState(profileName: string): InitialState {
  return {
    currentProfile: profileName,
    lastScanAt: null,
    version: '1.0.0',
  };
}

async function initAction(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const configPath = getConfigPath(cwd);
  const stateDir = getKimQuyDir(cwd);
  const statePath = `${stateDir}/state.json`;

  const configExists = fileExists(configPath);
  const stateExists = fileExists(statePath);

  if (configExists && !options.force) {
    logger.warn(`${CONFIG_FILE_NAME} already exists in this directory.`);
    logger.info('Use --force to overwrite existing configuration.');
    process.exit(1);
  }

  const spinner = logger.spinner('Initializing Kim Quy...');
  spinner.start();

  try {
    ensureDir(stateDir);

    const configContent = generateConfigContent(options.profile);
    writeTextFile(configPath, configContent);

    if (!stateExists || options.force) {
      const initialState = generateInitialState(options.profile);
      writeJson(statePath, initialState);
    }

    const skillsDir = `${cwd}/skills`;
    if (!fileExists(skillsDir)) {
      ensureDir(skillsDir);
    }

    spinner.succeed('Kim Quy initialized successfully!');

    logger.blank();
    logger.info('Created files:');
    logger.table({
      Config: configPath,
      State: stateDir,
      Skills: skillsDir,
    });

    logger.blank();
    logger.info('Next steps:');
    console.log('  1. Edit kimquy.config.ts to configure your profiles');
    console.log('  2. Create SKILL.md files in your skills directory');
    console.log('  3. Run "kq scan" to index your skills');
    console.log('  4. Run "kq adapt claude-code" to generate AI tool config');
    logger.blank();
  } catch (error) {
    spinner.fail('Failed to initialize Kim Quy');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    process.exit(1);
  }
}

export function createInitCommand(): Command {
  return new Command('init')
    .description('Initialize Kim Quy in current directory')
    .option('-p, --profile <name>', 'Default profile name', 'default')
    .option('-f, --force', 'Overwrite existing configuration', false)
    .action(initAction);
}
