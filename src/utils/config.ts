import os from "os";
import path from "path";

export function resolveBaseDir(argv: string[] = process.argv.slice(2)): string {
  const dirFlagIndex = argv.indexOf("--dir");
  let baseDir: string;

  if (dirFlagIndex !== -1 && argv[dirFlagIndex + 1]) {
    baseDir = argv[dirFlagIndex + 1];
  } else {
    baseDir = "~/drill";
  }

  if (baseDir.startsWith("~")) {
    baseDir = path.join(os.homedir(), baseDir.slice(1));
  }

  return path.resolve(baseDir);
}
