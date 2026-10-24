const Owner = require('./owner.model');
const bcrypt = require('bcrypt');

/**
 * Build safe Owner response
 *
 * passwordHash is read only to determine whether
 * a password has been configured. It is never returned.
 */
const buildOwnerResponse = async (owner) => {
  const ownerData = owner.toObject();

  const passwordOwner = await Owner.findOne({
    profileKey: 'OWNER',
  }).select('+passwordHash');

  const passwordConfigured = Boolean(passwordOwner?.passwordHash);

  delete ownerData.passwordHash;
  delete ownerData._id;
  delete ownerData.profileKey;

  return {
    ...ownerData,
    passwordConfigured,
  };
};

/**
 * Create Owner Profile
 */
const createOwner = async (ownerData) => {
  const owner = await Owner.create(ownerData);
  return owner;
};

/**
 * Update Owner Profile
 */
const updateOwner = async (profileData) => {
  const { passwordHash, passwordConfigured, ...safeProfileData } = profileData;

  const ownerProfile = await Owner.findOneAndUpdate(
    {
      profileKey: 'OWNER',
    },
    safeProfileData,
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );

  if (!ownerProfile) {
    throw new Error('Owner profile not found.');
  }

  return buildOwnerResponse(ownerProfile);
};

/**
 * Get Owner Profile
 */
const getOwner = async () => {
  const owner = await Owner.findOne({
    profileKey: 'OWNER',
  });

  if (!owner) {
    throw new Error('Owner not found.');
  }

  return buildOwnerResponse(owner);
};

/**
 * Authorize Owner
 *
 * First time:
 * - Creates the owner password.
 *
 * Existing password:
 * - Verifies the supplied password.
 */
const authorizeOwner = async ({ password, confirmPassword }) => {
  if (!password) {
    throw new Error('Password is required.');
  }

  const owner = await Owner.findOne({
    profileKey: 'OWNER',
  }).select('+passwordHash');

  if (!owner) {
    throw new Error('Owner profile not found.');
  }

  // First-time password setup
  if (!owner.passwordHash) {
    if (!confirmPassword) {
      throw new Error('Confirm password is required.');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    owner.passwordHash = passwordHash;
    await owner.save();

    return {
      authorized: true,
      passwordConfigured: true,
      message: 'Owner password created successfully.',
    };
  }

  // Existing password
  const isPasswordValid = await bcrypt.compare(password, owner.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid password.');
  }

  return {
    authorized: true,
    passwordConfigured: true,
    message: 'Owner authorized successfully.',
  };
};

module.exports = {
  createOwner,
  getOwner,
  updateOwner,
  authorizeOwner,
};
