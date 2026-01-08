import type { Skill } from '../core/skill/types.ts';

export interface AdapterContext {
  profileName: string;
  skills: Skill[];
  outputDir: string;
}

export abstract class BaseAdapter {
  abstract name: string;
  abstract generate(context: AdapterContext): Promise<void>;
  abstract validate?(): Promise<boolean>;
}
