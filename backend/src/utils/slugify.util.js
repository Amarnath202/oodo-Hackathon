'use strict';

/**
 * Converts a string to a URL-safe slug.
 * Appends a short random suffix to ensure uniqueness.
 * @param {string} text - Input string
 * @returns {string} URL-safe slug
 */
const slugify = (text) => {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars
    .replace(/[\s_]+/g, '-')    // spaces and underscores to hyphens
    .replace(/--+/g, '-')       // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens

  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
};

module.exports = { slugify };
