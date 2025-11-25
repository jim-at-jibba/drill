import os from "os";
import path from "path";
import fs from "fs";

export function resolveBaseDir(argv: string[] = process.argv.slice(2)): string {
  const dirFlagIndex = argv.indexOf("--dir");
  let baseDir: string;

  if (dirFlagIndex !== -1 && argv[dirFlagIndex + 1]) {
    baseDir = argv[dirFlagIndex + 1];
  } else if (process.env.DRILL_DIR) {
    baseDir = process.env.DRILL_DIR;
  } else {
    baseDir = "~/drill";
  }

  if (baseDir.startsWith("~")) {
    baseDir = path.join(os.homedir(), baseDir.slice(1));
  }

  return path.resolve(baseDir);
}

export function ensureBaseDirExists(baseDir: string): void {
  if (!fs.existsSync(baseDir)) {
    throw new Error(
      `Base directory does not exist: ${baseDir}\n\n` +
      `Please create the directory or specify a different path:\n` +
      `  mkdir -p ${baseDir}\n` +
      `  or use --dir flag: drill --dir /path/to/cards`
    );
  }

  const stats = fs.statSync(baseDir);
  if (!stats.isDirectory()) {
    throw new Error(`Base path is not a directory: ${baseDir}`);
  }
}

export function getLogLevel(): string {
  return process.env.DRILL_LOG_LEVEL || 
         process.env.LOG_LEVEL || 
         'INFO';
}
