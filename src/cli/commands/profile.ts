import { Command } from 'commander';
import { logger } from '../../utils/logger.ts';
import { ProfileManager } from '../../core/profile/manager.ts';
import pc from 'picocolors';

async function listAction(): Promise<void> {
  const manager = new ProfileManager();
  const profiles = await manager.list();

  if (profiles.length === 0) {
    logger.warn('No profiles configured.');
    logger.info('Run "kq init" to create a configuration file.');
    return;
  }

  logger.info('Profiles:\n');

  for (const profile of profiles) {
    const prefix = profile.isCurrent ? pc.green('▶') : ' ';
    const status = profile.isCurrent ? pc.dim(' (active)') : '';
    const name = profile.isCurrent ? pc.bold(profile.key) : profile.key;

    console.log(`${prefix} ${name}${status}`);
    console.log(`    Name: ${profile.name}`);
    if (profile.description) {
      console.log(`    Description: ${profile.description}`);
    }
    console.log(`    Skill Dirs: ${profile.skillDirs.join(', ')}`);
    console.log('');
  }
}

async function showAction(profileName: string): Promise<void> {
  const manager = new ProfileManager();
  const profile = await manager.getProfile(profileName);

  if (!profile) {
    logger.error(`Profile "${profileName}" not found.`);
    const available = await manager.getAvailableProfileKeys();
    logger.info(`Available profiles: ${available.join(', ')}`);
    process.exit(1);
  }

  const status = profile.isCurrent ? pc.green(' (active)') : '';
  console.log(`\nProfile: ${pc.bold(profile.key)}${status}\n`);

  logger.table({
    Name: profile.name,
    Description: profile.description || '(none)',
    'Skill Dirs': profile.skillDirs.join(', '),
  });

  if (profile.envVars && Object.keys(profile.envVars).length > 0) {
    logger.blank();
    logger.info('Environment Variables:');
    for (const [key, value] of Object.entries(profile.envVars)) {
      console.log(`  ${key}=${value}`);
    }
  }
}

function createProfileCommand(): Command {
  const profileCmd = new Command('profile').description('Manage profiles');

  profileCmd.command('list').alias('ls').description('List all profiles').action(listAction);

  profileCmd
    .command('show')
    .argument('<name>', 'Profile name')
    .description('Show profile details')
    .action(showAction);

  profileCmd
    .command('create')
    .argument('<name>', 'Profile name')
    .description('Create a new profile (edit kimquy.config.ts)')
    .action((name: string) => {
      logger.info(`To create profile "${name}", add it to your kimquy.config.ts:`);
      logger.blank();
      console.log('  profiles: {');
      console.log(`    ${name}: {`);
      console.log(`      name: '${name.charAt(0).toUpperCase() + name.slice(1)} Profile',`);
      console.log("      description: 'Description here',");
      console.log(`      skillDirs: ['./skills/${name}'],`);
      console.log('    },');
      console.log('  }');
      logger.blank();
      logger.info(`Then run "kq use ${name}" to switch to it.`);
    });

  profileCmd
    .command('delete')
    .argument('<name>', 'Profile name')
    .option('-f, --force', 'Skip confirmation')
    .description('Delete a profile (edit kimquy.config.ts)')
    .action(async (name: string) => {
      const manager = new ProfileManager();
      const current = await manager.getCurrent();

      if (current === name) {
        logger.error(`Cannot delete active profile "${name}".`);
        logger.info('Switch to another profile first with "kq use <profile>".');
        process.exit(1);
      }

      const profile = await manager.getProfile(name);
      if (!profile) {
        logger.error(`Profile "${name}" not found.`);
        process.exit(1);
      }

      logger.info(`To delete profile "${name}", remove it from your kimquy.config.ts`);
      logger.blank();
      logger.warn('Note: This CLI does not automatically modify your config file.');
      logger.info('Please edit kimquy.config.ts manually to remove the profile.');
    });

  return profileCmd;
}

export { createProfileCommand };
