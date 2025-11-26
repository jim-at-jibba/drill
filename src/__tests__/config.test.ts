import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { resolveBaseDir, ensureBaseDirExists } from '../utils/config.js';

describe('Config Validation', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'drill-config-test-'));
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('resolveBaseDir', () => {
    it('should use --dir flag when provided', () => {
      const testPath = '/test/path';
      const result = resolveBaseDir(['--dir', testPath]);
      expect(result).toBe(path.resolve(testPath));
    });

    it('should use DRILL_DIR env var when no flag', () => {
      const oldEnv = process.env.DRILL_DIR;
      process.env.DRILL_DIR = '/env/path';
      
      const result = resolveBaseDir([]);
      expect(result).toBe(path.resolve('/env/path'));
      
      // Restore
      if (oldEnv !== undefined) {
        process.env.DRILL_DIR = oldEnv;
      } else {
        delete process.env.DRILL_DIR;
      }
    });

    it('should reject empty DRILL_DIR env var', () => {
      const oldEnv = process.env.DRILL_DIR;
      process.env.DRILL_DIR = '   ';
      
      expect(() => resolveBaseDir([])).toThrow('DRILL_DIR environment variable cannot be empty');
      
      // Restore
      if (oldEnv !== undefined) {
        process.env.DRILL_DIR = oldEnv;
      } else {
        delete process.env.DRILL_DIR;
      }
    });

    it('should expand ~ to home directory', () => {
      const result = resolveBaseDir(['--dir', '~/test']);
      expect(result).toBe(path.resolve(path.join(os.homedir(), 'test')));
    });

    it('should default to ~/drill', () => {
      const oldEnv = process.env.DRILL_DIR;
      delete process.env.DRILL_DIR;
      
      const result = resolveBaseDir([]);
      expect(result).toBe(path.resolve(path.join(os.homedir(), 'drill')));
      
      // Restore
      if (oldEnv !== undefined) {
        process.env.DRILL_DIR = oldEnv;
      }
    });
  });

  describe('ensureBaseDirExists', () => {
    it('should create missing directory', () => {
      const testPath = path.join(tempDir, 'new-dir');
      expect(fs.existsSync(testPath)).toBe(false);
      
      ensureBaseDirExists(testPath);
      
      expect(fs.existsSync(testPath)).toBe(true);
      expect(fs.statSync(testPath).isDirectory()).toBe(true);
    });

    it('should create nested directories', () => {
      const testPath = path.join(tempDir, 'nested', 'deep', 'dir');
      expect(fs.existsSync(testPath)).toBe(false);
      
      ensureBaseDirExists(testPath);
      
      expect(fs.existsSync(testPath)).toBe(true);
      expect(fs.statSync(testPath).isDirectory()).toBe(true);
    });

    it('should reject file path as baseDir', () => {
      const filePath = path.join(tempDir, 'test-file.txt');
      fs.writeFileSync(filePath, 'test content');
      
      expect(() => ensureBaseDirExists(filePath)).toThrow('Base path is not a directory');
    });

    it('should accept valid writable directory', () => {
      expect(() => ensureBaseDirExists(tempDir)).not.toThrow();
    });

    it('should handle already existing directory', () => {
      const existingDir = path.join(tempDir, 'existing');
      fs.mkdirSync(existingDir);
      
      expect(() => ensureBaseDirExists(existingDir)).not.toThrow();
      expect(fs.existsSync(existingDir)).toBe(true);
    });

    // Note: Testing non-writable directory is tricky in CI/CD environments
    // and depends on OS permissions. Skipping this test for now.
    // In production, the fs.accessSync check will catch permission errors.
  });
});
