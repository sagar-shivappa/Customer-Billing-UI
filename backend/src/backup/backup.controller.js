const { createBackup } = require('./backup.service');

const createBackupController = async (req, res, next) => {
  try {
    const result = await createBackup();

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBackupController,
};
