import type { Skill } from './types.ts';

export class SkillIndexer {
  async scan(_directories: string[]): Promise<Skill[]> {
    return [];
  }

  async getForProfile(_profileName: string): Promise<Skill[]> {
    return [];
  }
}
