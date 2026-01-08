import { Command } from 'commander';
import { logger } from '../../utils/logger.ts';
import { ProfileManager } from '../../core/profile/manager.ts';
import { isKimQuyError } from '../../utils/errors.ts';

async function useAction(profileName?: string): Promise<void> {
  const manager = new ProfileManager();

  if (!profileName) {
    const current = await manager.getCurrentProfile();
    if (current) {
      logger.info(`Current profile: ${current.key}`);
      logger.table({
        Name: current.name,
        Description: current.description || '(none)',
        'Skill Dirs': current.skillDirs.join(', '),
      });
    } else {
      const profiles = await manager.list();
      if (profiles.length === 0) {
        logger.warn('No profiles configured.');
        logger.info('Run "kq init" to create a configuration file.');
      } else {
        logger.info('Available profiles:');
        for (const p of profiles) {
          console.log(`  - ${p.key}: ${p.name}`);
        }
        logger.blank();
        logger.info('Run "kq use <profile>" to switch profiles.');
      }
    }
    return;
  }

  try {
    const profile = await manager.switchTo(profileName);

    logger.success(`Switched to profile: ${profile.key}`);
    logger.blank();
    logger.table({
      Name: profile.name,
      Description: profile.description || '(none)',
      'Skill Dirs': profile.skillDirs.join(', '),
    });

    if (profile.envVars && Object.keys(profile.envVars).length > 0) {
      logger.blank();
      logger.info('Environment variables set:');
      for (const [key, value] of Object.entries(profile.envVars)) {
        console.log(`  ${key}=${value}`);
      }
    }

    logger.blank();
    logger.info('Run "kq scan" to index skills for this profile.');
  } catch (error) {
    if (isKimQuyError(error)) {
      logger.error(error.message);
      if (error.suggestions) {
        logger.blank();
        logger.info('Suggestions:');
        for (const s of error.suggestions) {
          console.log(`  • ${s}`);
        }
      }
      process.exit(1);
    }
    throw error;
  }
}

export function createUseCommand(): Command {
  return new Command('use')
    .argument('[profile]', 'Profile name to switch to')
    .description('Switch to a profile')
    .action(useAction);
}
