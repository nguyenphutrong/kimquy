import { defineConfig } from 'kimquy';

export default defineConfig({
  profiles: {
    work: {
      name: 'Work Profile',
      description: 'Enterprise development context',
      skillDirs: ['./skills/work', './skills/shared'],
      envVars: {
        PAI_PROFILE: 'work',
        PAI_CONTEXT: 'enterprise',
      },
    },
    personal: {
      name: 'Personal Projects',
      description: 'Personal side projects and experiments',
      skillDirs: ['./skills/personal', './skills/shared'],
      envVars: {
        PAI_PROFILE: 'personal',
      },
    },
  },
  defaultProfile: 'work',
  skillPatterns: ['**/SKILL.md'],
});
