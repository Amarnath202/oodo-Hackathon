'use strict';

const { slugify } = require('../utils/slugify.util');
const { Trip } = require('../models');

/**
 * Generates a unique public slug for a trip.
 * Retries up to 5 times if slug collision occurs.
 * @param {string} tripName
 * @returns {Promise<string>} Unique slug
 */
const generateUniqueSlug = async (tripName) => {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const slug = slugify(tripName);
    const existing = await Trip.findOne({ where: { public_slug: slug } });

    if (!existing) return slug;
    attempts++;
  }

  throw new Error('Failed to generate a unique slug after multiple attempts');
};

module.exports = { generateUniqueSlug };
