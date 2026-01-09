import type { KimQuyConfig } from './schema.ts';

export const defaultConfig: KimQuyConfig = {
  profiles: {
    default: {
      name: 'Default Profile',
      description: 'Default AI context profile',
      skillDirs: ['./skills'],
    },
  },
  defaultProfile: 'default',
  skillPatterns: ['**/SKILL.md', '**/*.skill.md'],
  adapters: {
    'claude-code': {
      enabled: true,
    },
  },
};

export function mergeConfigs(
  globalConfig: Partial<KimQuyConfig>,
  projectConfig: Partial<KimQuyConfig>
): Partial<KimQuyConfig> {
  const mergedProfiles = {
    ...globalConfig.profiles,
    ...projectConfig.profiles,
  };

  const mergedAdapters = {
    ...globalConfig.adapters,
    ...projectConfig.adapters,
  };

  return {
    ...globalConfig,
    ...projectConfig,
    profiles: mergedProfiles,
    adapters: mergedAdapters,
  };
}

export function mergeWithDefaults(userConfig: Partial<KimQuyConfig>): KimQuyConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    profiles: {
      ...defaultConfig.profiles,
      ...userConfig.profiles,
    },
    adapters: {
      ...defaultConfig.adapters,
      ...userConfig.adapters,
    },
  };
}
