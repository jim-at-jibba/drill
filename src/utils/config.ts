import os from "os";
import path from "path";
import fs from "fs";

/**
 * Resolves base directory for flashcard storage from CLI args, env vars, or default.
 * Priority: 1) --dir flag, 2) DRILL_DIR env var, 3) ~/drill default.
 * Expands ~ to home directory and returns absolute path.
 * @param argv - Command-line arguments (defaults to process.argv)
 * @returns Absolute path to base directory
 * @throws {Error} DRILL_DIR is empty or home directory cannot be resolved
 */
export function resolveBaseDir(argv: string[] = process.argv.slice(2)): string {
  const dirFlagIndex = argv.indexOf("--dir");
  let baseDir: string;

  if (dirFlagIndex !== -1 && argv[dirFlagIndex + 1]) {
    baseDir = argv[dirFlagIndex + 1];
  } else if (process.env.DRILL_DIR) {
    baseDir = process.env.DRILL_DIR;
    // Validate env var is not empty
    if (baseDir.trim().length === 0) {
      throw new Error('DRILL_DIR environment variable cannot be empty');
    }
  } else {
    baseDir = "~/drill";
  }

  if (baseDir.startsWith("~")) {
    const home = os.homedir();
    if (!home) {
      throw new Error('Cannot resolve home directory');
    }
    baseDir = path.join(home, baseDir.slice(1));
  }

  return path.resolve(baseDir);
}

/**
 * Ensures base directory exists, is a directory, and is writable.
 * Auto-creates directory with parents if missing. Validates permissions.
 * @param baseDir - Absolute path to base directory
 * @throws {Error} Cannot create/access directory, path is not a directory, or insufficient write permissions
 */
export function ensureBaseDirExists(baseDir: string): void {
  // Create if missing
  if (!fs.existsSync(baseDir)) {
    try {
      fs.mkdirSync(baseDir, { recursive: true });
    } catch (err) {
      throw new Error(
        `Cannot create directory: ${baseDir}\n` +
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}\n\n` +
        `Please check permissions or specify a different path:\n` +
        `  drill --dir /path/to/cards`
      );
    }
  }

  // Verify it's a directory
  let stats: fs.Stats;
  try {
    stats = fs.statSync(baseDir);
  } catch (err) {
    throw new Error(
      `Cannot access directory: ${baseDir}\n` +
      `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  if (!stats.isDirectory()) {
    throw new Error(
      `Base path is not a directory: ${baseDir}\n` +
      `Please specify a directory path, not a file.`
    );
  }

  // Check write permissions
  try {
    fs.accessSync(baseDir, fs.constants.W_OK);
  } catch (err) {
    throw new Error(
      `Directory is not writable: ${baseDir}\n` +
      `Please check folder permissions:\n` +
      `  chmod u+w ${baseDir}`
    );
  }
}

/**
 * Gets log level from environment variables (DRILL_LOG_LEVEL or LOG_LEVEL).
 * @returns Log level string (defaults to 'INFO')
 */
export function getLogLevel(): string {
  return process.env.DRILL_LOG_LEVEL || 
         process.env.LOG_LEVEL || 
         'INFO';
}
