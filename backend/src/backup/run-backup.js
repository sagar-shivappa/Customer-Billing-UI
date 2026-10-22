const path = require('path');
const dotenv = require('dotenv');

const envFile = process.argv.includes('--production') ? '.env.production' : '.env';

dotenv.config({
  path: path.resolve(process.cwd(), envFile),
});

const { createBackup } = require('./backup.service');

const run = async () => {
  try {
    console.log('Starting scheduled MongoDB backup...');

    const result = await createBackup();

    console.log('Backup completed successfully.');
    console.log(`Backup file: ${result.file}`);

    process.exitCode = 0;
  } catch (error) {
    console.error('Backup failed.');
    console.error(error.message);

    process.exitCode = 1;
  }
};

run();
