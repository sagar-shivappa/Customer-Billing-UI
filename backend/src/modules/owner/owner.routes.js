const express = require('express');

const ownerController = require('./owner.controller');

const router = express.Router();

/**
 * Create Owner
 * POST /api/owner
 */
router.post('/', ownerController.addOwner);

/**
 * Get owner
 * GET /api/owner
 */
router.get('/', ownerController.getOwner);

/**
 * Update owner
 * PuT /api/owner
 */
router.put('/', ownerController.updateOwner);

/**
 * Authorize Owner
 * POST /api/owner/authorize
 */
router.post('/authorize', ownerController.authorizeOwner);

module.exports = router;
