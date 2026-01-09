import { Command } from 'commander';
import { logger } from '../../utils/logger.ts';
import {
  fileExists,
  ensureDir,
  writeTextFile,
  writeJson,
  getKimQuyDir,
  getConfigPath,
  getGlobalConfigDir,
  getGlobalConfigPath,
  getGlobalKimQuyDir,
  getGlobalSkillsDir,
  CONFIG_FILE_NAME,
} from '../../utils/fs.ts';

interface InitOptions {
  profile: string;
  force: boolean;
  global: boolean;
}

function generateConfigContent(profileName: string, isGlobal: boolean): string {
  const skillsDir = isGlobal ? './skills' : './skills';
  const description = isGlobal ? 'Global AI context profile' : `AI context profile for ${profileName}`;

  return `/** @type {import('kimquy').UserConfig} */
export default {
  profiles: {
    ${profileName}: {
      name: '${profileName.charAt(0).toUpperCase() + profileName.slice(1)} Profile',
      description: '${description}',
      skillDirs: ['${skillsDir}'],
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
  const isGlobal = options.global;

  const baseDir = isGlobal ? getGlobalConfigDir() : process.cwd();
  const configPath = isGlobal ? getGlobalConfigPath() : getConfigPath(baseDir);
  const stateDir = isGlobal ? getGlobalKimQuyDir() : getKimQuyDir(baseDir);
  const statePath = `${stateDir}/state.json`;
  const skillsDir = isGlobal ? getGlobalSkillsDir() : `${baseDir}/skills`;

  const configExists = fileExists(configPath);
  const stateExists = fileExists(statePath);

  if (configExists && !options.force) {
    const location = isGlobal ? 'global configuration' : 'this directory';
    logger.warn(`${CONFIG_FILE_NAME} already exists in ${location}.`);
    logger.info('Use --force to overwrite existing configuration.');
    process.exit(1);
  }

  const initType = isGlobal ? 'global' : 'project';
  const spinner = logger.spinner(`Initializing Kim Quy (${initType})...`);
  spinner.start();

  try {
    ensureDir(stateDir);

    const configContent = generateConfigContent(options.profile, isGlobal);
    writeTextFile(configPath, configContent);

    if (!stateExists || options.force) {
      const initialState = generateInitialState(options.profile);
      writeJson(statePath, initialState);
    }

    if (!fileExists(skillsDir)) {
      ensureDir(skillsDir);
    }

    const successMsg = isGlobal
      ? 'Kim Quy initialized globally!'
      : 'Kim Quy initialized successfully!';
    spinner.succeed(successMsg);

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

    if (isGlobal) {
      logger.blank();
      logger.info('Global config will be merged with project-level configs.');
    }

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
    .description('Initialize Kim Quy in current directory or globally')
    .option('-p, --profile <name>', 'Default profile name', 'default')
    .option('-f, --force', 'Overwrite existing configuration', false)
    .option('-g, --global', 'Initialize global user-level configuration', false)
    .action(initAction);
}
