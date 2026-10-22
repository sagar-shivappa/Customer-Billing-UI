const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

/**
 * Find mongodump.exe.
 *
 * Priority:
 * 1. MONGODUMP_PATH environment variable
 * 2. Common MongoDB Database Tools installation paths
 * 3. mongodump available through system PATH
 */
const findMongoDumpPath = () => {
  // 1. Explicit path configured by the installer/environment.
  if (process.env.MONGODUMP_PATH) {
    return process.env.MONGODUMP_PATH;
  }

  // 2. Common MongoDB Database Tools locations.
  const possiblePaths = [
    'C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongodump.exe',
    'C:\\Program Files\\MongoDB\\Tools\\bin\\mongodump.exe',
    'C:\\Program Files\\MongoDB\\Database Tools\\bin\\mongodump.exe',
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  // 3. Fall back to PATH.
  return 'mongodump';
};

const BACKUP_DIRECTORY = path.join(
  process.env.ProgramData || 'C:\\ProgramData',
  'Ashraya Software Solutions',
  'Customer Billing',
  'backups',
);

const MAX_BACKUPS = 30;

const removeOldBackups = async () => {
  const files = await fs.promises.readdir(BACKUP_DIRECTORY);

  const backupFiles = [];

  for (const file of files) {
    if (!file.startsWith('backup-') || !file.endsWith('.archive.gz')) {
      continue;
    }

    const filePath = path.join(BACKUP_DIRECTORY, file);
    const stats = await fs.promises.stat(filePath);

    backupFiles.push({
      filePath,
      modifiedTime: stats.mtimeMs,
    });
  }

  // Newest first.
  backupFiles.sort((a, b) => b.modifiedTime - a.modifiedTime);

  const filesToDelete = backupFiles.slice(MAX_BACKUPS);

  for (const backup of filesToDelete) {
    await fs.promises.unlink(backup.filePath);
  }
};

const createBackup = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured.');
  }

  await fs.promises.mkdir(BACKUP_DIRECTORY, {
    recursive: true,
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const backupFile = path.join(BACKUP_DIRECTORY, `backup-${timestamp}.archive.gz`);

  try {
    const mongodumpPath = findMongoDumpPath();

    console.log(`Using mongodump: ${mongodumpPath}`);

    await execFileAsync(mongodumpPath, [
      `--uri=${process.env.MONGO_URI}`,
      `--archive=${backupFile}`,
      '--gzip',
    ]);

    // Only clean old backups after a successful backup.
    await removeOldBackups();

    return {
      success: true,
      file: backupFile,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    // Remove incomplete backup if mongodump failed.
    try {
      await fs.promises.unlink(backupFile);
    } catch {
      // Ignore cleanup errors.
    }

    throw new Error(`MongoDB backup failed: ${error.message}`);
  }
};

module.exports = {
  createBackup,
};
