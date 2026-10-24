const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  profileKey: {
    type: String,
    required: true,
    unique: true,
    default: 'OWNER',
  },

  shopName: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  pinCode: {
    type: String,
    required: true,
  },

  gstin: {
    type: String,
  },

  productCategories: {
    type: [String],
    default: [],
  },

  stockManagement: {
    type: Boolean,
    default: false,
  },

  includeGst: {
    type: Boolean,
    default: false,
  },

  gstPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  flexiblePricing: {
    type: Boolean,
    default: false,
  },

  // Software license expiry date.
  // Stored as YYYY-MM-DD because this is a date-only value.
  softwareExpiryDate: {
    type: String,
    default: '',
    match: /^\d{4}-\d{2}-\d{2}$/,
  },
});

module.exports = mongoose.model('Owner', ownerSchema);
