'use strict';

/**
 * Builds pagination metadata and Sequelize limit/offset options.
 * @param {object} query - Express request query object
 * @param {number} totalCount - Total number of records
 * @returns {{ limit: number, offset: number, pagination: object }}
 */
const paginate = (query, totalCount) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    limit,
    offset,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages,
    },
  };
};

module.exports = { paginate };
