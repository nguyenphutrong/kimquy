export class KimQuyError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = 'KimQuyError';
  }

  format(): string {
    let output = `${this.name}: ${this.message}`;
    if (this.suggestions && this.suggestions.length > 0) {
      output += '\n\nSuggestions:';
      for (const suggestion of this.suggestions) {
        output += `\n  • ${suggestion}`;
      }
    }
    return output;
  }
}

export class ConfigError extends KimQuyError {
  constructor(message: string, suggestions?: string[]) {
    super(message, 'CONFIG_ERROR', suggestions);
    this.name = 'ConfigError';
  }
}

export class ProfileError extends KimQuyError {
  constructor(message: string, suggestions?: string[]) {
    super(message, 'PROFILE_ERROR', suggestions);
    this.name = 'ProfileError';
  }
}

export class SkillError extends KimQuyError {
  constructor(message: string, suggestions?: string[]) {
    super(message, 'SKILL_ERROR', suggestions);
    this.name = 'SkillError';
  }
}

export class AdapterError extends KimQuyError {
  constructor(message: string, suggestions?: string[]) {
    super(message, 'ADAPTER_ERROR', suggestions);
    this.name = 'AdapterError';
  }
}

export class FileSystemError extends KimQuyError {
  constructor(message: string, suggestions?: string[]) {
    super(message, 'FS_ERROR', suggestions);
    this.name = 'FileSystemError';
  }
}

export function isKimQuyError(error: unknown): error is KimQuyError {
  return error instanceof KimQuyError;
}
