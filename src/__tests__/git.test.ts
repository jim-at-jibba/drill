import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { isGitRepository, stageChanges, commitChanges, stageAndCommit, hasRemote, pushChanges } from '../utils/git.js';

const execAsync = promisify(exec);

describe('Git utilities', () => {
  let testDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    testDir = path.join(process.cwd(), 'test-git-utils');
    originalCwd = process.cwd();
    
    // Clean up any existing test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
    
    // Initialize git repo
    await execAsync('git init');
    await execAsync('git config user.email "test@example.com"');
    await execAsync('git config user.name "Test User"');
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('isGitRepository', () => {
    it('should return true for git repository', async () => {
      const result = await isGitRepository(testDir);
      expect(result).toBe(true);
    });

    it('should return false for non-git directory', async () => {
      const nonGitDir = path.join(process.cwd(), 'non-git-dir');
      fs.mkdirSync(nonGitDir, { recursive: true });
      
      const result = await isGitRepository(nonGitDir);
      expect(result).toBe(false);
      
      fs.rmSync(nonGitDir, { recursive: true, force: true });
    });
  });

  describe('stageChanges', () => {
    it('should stage files successfully', async () => {
      // Create a test file
      const testFile = path.join(testDir, 'test.txt');
      fs.writeFileSync(testFile, 'test content');
      
      await expect(stageChanges(testDir)).resolves.not.toThrow();
    });
  });

  describe('commitChanges', () => {
    it('should commit changes successfully', async () => {
      // Create and stage a test file
      const testFile = path.join(testDir, 'test.txt');
      fs.writeFileSync(testFile, 'test content');
      await execAsync('git add test.txt');
      
      await expect(commitChanges(testDir, 'Test commit')).resolves.not.toThrow();
      
      // Verify commit was created
      const { stdout } = await execAsync('git log --oneline');
      expect(stdout).toContain('Test commit');
    });
  });

  describe('stageAndCommit', () => {
    it('should stage and commit changes successfully', async () => {
      // Create a test file
      const testFile = path.join(testDir, 'test.txt');
      fs.writeFileSync(testFile, 'test content');
      
      await expect(stageAndCommit(testDir, 'Test stage and commit')).resolves.not.toThrow();
      
      // Verify commit was created
      const { stdout } = await execAsync('git log --oneline');
      expect(stdout).toContain('Test stage and commit');
    });
  });

  describe('hasRemote', () => {
    it('should return false when no remote is configured', async () => {
      const result = await hasRemote(testDir);
      expect(result).toBe(false);
    });

    it('should return true when a remote is configured', async () => {
      await execAsync('git remote add origin https://example.com/repo.git', { cwd: testDir });
      const result = await hasRemote(testDir);
      expect(result).toBe(true);
    });
  });
});
