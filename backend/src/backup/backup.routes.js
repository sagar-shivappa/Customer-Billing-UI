const router = require('express').Router();

const { createBackupController } = require('./backup.controller');

router.post('/', createBackupController);

module.exports = router;
