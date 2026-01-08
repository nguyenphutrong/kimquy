import { describe, test, expect } from 'bun:test';
import {
  KimQuyError,
  ConfigError,
  ProfileError,
  SkillError,
  FileSystemError,
  isKimQuyError,
} from '../../../src/utils/errors.ts';

describe('Error Classes', () => {
  describe('KimQuyError', () => {
    test('creates error with message and code', () => {
      const error = new KimQuyError('Test error', 'TEST_ERROR');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('KimQuyError');
    });

    test('creates error with suggestions', () => {
      const error = new KimQuyError('Test error', 'TEST_ERROR', ['Try this', 'Or this']);
      expect(error.suggestions).toEqual(['Try this', 'Or this']);
    });

    test('format() returns formatted string', () => {
      const error = new KimQuyError('Test error', 'TEST_ERROR', ['Try this']);
      const formatted = error.format();
      expect(formatted).toContain('Test error');
      expect(formatted).toContain('Suggestions');
      expect(formatted).toContain('Try this');
    });
  });

  describe('Specialized errors', () => {
    test('ConfigError has CONFIG_ERROR code', () => {
      const error = new ConfigError('Config issue');
      expect(error.code).toBe('CONFIG_ERROR');
      expect(error.name).toBe('ConfigError');
    });

    test('ProfileError has PROFILE_ERROR code', () => {
      const error = new ProfileError('Profile issue');
      expect(error.code).toBe('PROFILE_ERROR');
      expect(error.name).toBe('ProfileError');
    });

    test('SkillError has SKILL_ERROR code', () => {
      const error = new SkillError('Skill issue');
      expect(error.code).toBe('SKILL_ERROR');
      expect(error.name).toBe('SkillError');
    });

    test('FileSystemError has FS_ERROR code', () => {
      const error = new FileSystemError('FS issue');
      expect(error.code).toBe('FS_ERROR');
      expect(error.name).toBe('FileSystemError');
    });
  });

  describe('isKimQuyError', () => {
    test('returns true for KimQuyError instances', () => {
      expect(isKimQuyError(new KimQuyError('test', 'TEST'))).toBe(true);
      expect(isKimQuyError(new ConfigError('test'))).toBe(true);
      expect(isKimQuyError(new ProfileError('test'))).toBe(true);
    });

    test('returns false for other errors', () => {
      expect(isKimQuyError(new Error('test'))).toBe(false);
      expect(isKimQuyError(null)).toBe(false);
      expect(isKimQuyError('string')).toBe(false);
    });
  });
});
