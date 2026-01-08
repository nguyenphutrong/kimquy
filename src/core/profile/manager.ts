import type { Profile as ConfigProfile, KimQuyConfig } from '../config/schema.ts';
import { getConfig } from '../config/loader.ts';
import { getCurrentProfile, setCurrentProfile } from '../state/store.ts';
import { ProfileError } from '../../utils/errors.ts';

export interface ProfileInfo {
  key: string;
  name: string;
  description?: string;
  skillDirs: string[];
  envVars?: Record<string, string>;
  isCurrent: boolean;
}

function configProfileToInfo(
  key: string,
  profile: ConfigProfile,
  currentKey: string | null
): ProfileInfo {
  return {
    key,
    name: profile.name,
    description: profile.description,
    skillDirs: profile.skillDirs,
    envVars: profile.envVars,
    isCurrent: key === currentKey,
  };
}

export class ProfileManager {
  private config: KimQuyConfig | null = null;
  private cwd: string;

  constructor(cwd?: string) {
    this.cwd = cwd || process.cwd();
  }

  private async ensureConfig(): Promise<KimQuyConfig> {
    if (!this.config) {
      this.config = await getConfig(this.cwd);
    }
    return this.config;
  }

  async getCurrent(): Promise<string | null> {
    return getCurrentProfile(this.cwd);
  }

  async getCurrentProfile(): Promise<ProfileInfo | null> {
    const currentKey = await this.getCurrent();
    if (!currentKey) return null;

    const config = await this.ensureConfig();
    const profile = config.profiles[currentKey];
    if (!profile) return null;

    return configProfileToInfo(currentKey, profile, currentKey);
  }

  async list(): Promise<ProfileInfo[]> {
    const config = await this.ensureConfig();
    const currentKey = await this.getCurrent();

    return Object.entries(config.profiles).map(([key, profile]) =>
      configProfileToInfo(key, profile, currentKey)
    );
  }

  async getProfile(key: string): Promise<ProfileInfo | null> {
    const config = await this.ensureConfig();
    const profile = config.profiles[key];
    if (!profile) return null;

    const currentKey = await this.getCurrent();
    return configProfileToInfo(key, profile, currentKey);
  }

  async switchTo(profileKey: string): Promise<ProfileInfo> {
    const config = await this.ensureConfig();
    const profile = config.profiles[profileKey];

    if (!profile) {
      const availableProfiles = Object.keys(config.profiles);
      throw new ProfileError(`Profile "${profileKey}" not found`, [
        `Available profiles: ${availableProfiles.join(', ')}`,
        'Check your kimquy.config.ts file',
      ]);
    }

    setCurrentProfile(profileKey, this.cwd);

    if (profile.envVars) {
      for (const [key, value] of Object.entries(profile.envVars)) {
        process.env[key] = value;
      }
    }

    process.env.KQ_PROFILE = profileKey;

    return configProfileToInfo(profileKey, profile, profileKey);
  }

  async getAvailableProfileKeys(): Promise<string[]> {
    const config = await this.ensureConfig();
    return Object.keys(config.profiles);
  }

  async getDefaultProfileKey(): Promise<string> {
    const config = await this.ensureConfig();
    return config.defaultProfile;
  }
}
