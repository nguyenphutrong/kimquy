import type { Profile } from './types.ts';

export class ProfileManager {
  private currentProfile: string | null = null;

  async switchTo(_profileName: string): Promise<void> {
    throw new Error('Not implemented');
  }

  getCurrent(): string | null {
    return this.currentProfile;
  }

  async list(): Promise<Profile[]> {
    return [];
  }
}
