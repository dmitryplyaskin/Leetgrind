import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const LOCK_FILE_NAME = "leetgrind-server.lock";

interface DataDirLockMetadata {
  acquiredAt: string;
  dataDir: string;
  pid: number;
}

export class DataDirLockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataDirLockError";
  }
}

export interface DataDirLock {
  dataDir: string;
  lockPath: string;
  release: () => Promise<void>;
}

function isProcessAlive(pid: number) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    return code === "EPERM";
  }
}

function readLockMetadata(lockPath: string): DataDirLockMetadata | null {
  if (!existsSync(lockPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(lockPath, "utf8")) as DataDirLockMetadata;
  } catch {
    throw new DataDirLockError(
      `Leetgrind cannot read the PGLite lock file at ${lockPath}. ` +
        "Stop any running dev server or remove the stale lock file before starting again.",
    );
  }
}

function removeStaleLock(lockPath: string) {
  try {
    unlinkSync(lockPath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;

    if (code !== "ENOENT") {
      throw error;
    }
  }
}

export function acquireDataDirLock(
  dataDir: string | null | undefined,
): DataDirLock | null {
  if (dataDir === null || typeof dataDir === "undefined") {
    return null;
  }

  const resolvedDataDir = resolve(dataDir);
  const lockPath = resolve(resolvedDataDir, LOCK_FILE_NAME);

  mkdirSync(resolvedDataDir, { recursive: true });

  while (true) {
    try {
      const fd = openSync(lockPath, "wx");
      const metadata: DataDirLockMetadata = {
        acquiredAt: new Date().toISOString(),
        dataDir: resolvedDataDir,
        pid: process.pid,
      };

      try {
        writeFileSync(fd, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
      } finally {
        closeSync(fd);
      }

      let released = false;

      return {
        dataDir: resolvedDataDir,
        lockPath,
        release: async () => {
          if (released) {
            return;
          }

          released = true;
          removeStaleLock(lockPath);
        },
      };
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== "EEXIST") {
        throw error;
      }

      const metadata = readLockMetadata(lockPath);

      if (metadata && isProcessAlive(metadata.pid)) {
        throw new DataDirLockError(
          `Another Leetgrind server process is already using the PGLite data directory ${resolvedDataDir}. ` +
            `Owning PID: ${metadata.pid}. Stop the existing dev server before starting a new one.`,
        );
      }

      removeStaleLock(lockPath);
    }
  }
}
