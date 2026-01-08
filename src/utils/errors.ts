export class KimQuyError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'KimQuyError';
  }
}

export class ConfigError extends KimQuyError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}

export class SkillError extends KimQuyError {
  constructor(message: string) {
    super(message, 'SKILL_ERROR');
    this.name = 'SkillError';
  }
}

export class ProfileError extends KimQuyError {
  constructor(message: string) {
    super(message, 'PROFILE_ERROR');
    this.name = 'ProfileError';
  }
}

export class AdapterError extends KimQuyError {
  constructor(message: string) {
    super(message, 'ADAPTER_ERROR');
    this.name = 'AdapterError';
  }
}
