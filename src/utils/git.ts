import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { logger } from "./logger.js";

const execAsync = promisify(exec);

/**
 * Checks if a directory is a git repository
 * @param dirPath - Directory path to check
 * @returns boolean indicating if directory is a git repository
 */
export async function isGitRepository(dirPath: string): Promise<boolean> {
  try {
    const gitDir = path.join(dirPath, ".git");
    return fs.existsSync(gitDir);
  } catch (err) {
    logger.warn("Failed to check git repository status", {
      dirPath,
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return false;
  }
}

/**
 * Stages all changes in the repository
 * @param repoPath - Path to the git repository
 * @throws Error if staging fails
 */
export async function stageChanges(repoPath: string): Promise<void> {
  try {
    await execAsync("git add .", { cwd: repoPath });
    logger.debug("Staged changes in git repository", { repoPath });
  } catch (err) {
    const error = err as Error;
    logger.warn("Failed to stage changes", {
      repoPath,
      error: error.message
    });
    throw new Error(`Failed to stage changes: ${error.message}`);
  }
}

/**
 * Commits staged changes with the given message
 * @param repoPath - Path to the git repository
 * @param message - Commit message
 * @throws Error if commit fails
 */
export async function commitChanges(repoPath: string, message: string): Promise<void> {
  try {
    await execAsync(`git commit -m "${message}"`, { cwd: repoPath });
    logger.info("Committed changes to git repository", { 
      repoPath, 
      message: message.substring(0, 50) + (message.length > 50 ? "..." : "")
    });
  } catch (err) {
    const error = err as Error;
    logger.warn("Failed to commit changes", {
      repoPath,
      error: error.message
    });
    throw new Error(`Failed to commit changes: ${error.message}`);
  }
}

/**
 * Stages and commits changes in a single operation
 * @param repoPath - Path to the git repository
 * @param message - Commit message
 * @throws Error if staging or committing fails
 */
export async function stageAndCommit(repoPath: string, message: string): Promise<void> {
  try {
    await stageChanges(repoPath);
    await commitChanges(repoPath, message);
  } catch (err) {
    const error = err as Error;
    logger.warn("Failed to stage and commit changes", {
      repoPath,
      error: error.message
    });
    throw error;
  }
}

/**
 * Gets the current git status
 * @param repoPath - Path to the git repository
 * @returns Object with status information
 */
export async function getGitStatus(repoPath: string): Promise<{ hasChanges: boolean; message: string }> {
  try {
    const { stdout } = await execAsync("git status --porcelain", { cwd: repoPath });
    const hasChanges = stdout.trim().length > 0;
    return {
      hasChanges,
      message: hasChanges ? "Changes detected" : "No changes detected"
    };
  } catch (err) {
    logger.warn("Failed to get git status", {
      repoPath,
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return { hasChanges: false, message: "Unable to check git status" };
  }
}

export async function hasRemote(repoPath: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync("git remote", { cwd: repoPath });
    return stdout.trim().length > 0;
  } catch (err) {
    logger.warn("Failed to check for git remote", {
      repoPath,
      error: err instanceof Error ? err.message : 'Unknown error'
    });
    return false;
  }
}

export async function pushChanges(repoPath: string): Promise<void> {
  try {
    await execAsync("git push", { cwd: repoPath });
    logger.info("Pushed changes to remote", { repoPath });
  } catch (err) {
    const error = err as Error;
    logger.warn("Failed to push changes", {
      repoPath,
      error: error.message
    });
    throw new Error(`Failed to push changes: ${error.message}`);
  }
}

export async function stageCommitAndPush(repoPath: string, message: string): Promise<void> {
  await stageAndCommit(repoPath, message);
  
  if (await hasRemote(repoPath)) {
    await pushChanges(repoPath);
  }
}
