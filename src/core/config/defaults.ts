import type { KimQuyConfig } from './schema.js';

export const defaultConfig: KimQuyConfig = {
  profiles: {
    default: {
      name: 'Default Profile',
      description: 'Default AI context profile',
      skillDirs: ['./skills'],
    },
  },
  defaultProfile: 'default',
  skillPatterns: ['**/SKILL.md'],
};
