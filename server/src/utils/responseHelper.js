// Standard API response helper MABBACA
const successResponse = (res, message, data = null, statusCode = 200, meta = null) => {
  const responseBody = {
    success: true,
    message,
    data,
  };

  if (meta) {
    responseBody.meta = meta;
    // Alias untuk kompatibilitas frontend jika ada yang mengakses data.pagination
    responseBody.pagination = {
      currentPage: meta.page,
      perPage: meta.limit,
      totalItems: meta.total,
      totalPages: meta.totalPages,
      hasNextPage: meta.page < meta.totalPages,
      hasPrevPage: meta.page > 1,
    };
  }

  return res.status(statusCode).json(responseBody);
};

const errorResponse = (res, message, statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors ? (Array.isArray(errors) ? errors : [errors]) : [],
  });
};

const paginateResponse = (res, message, data, page, limit, total) => {
  const p = parseInt(page) || 1;
  const l = parseInt(limit) || 12;
  const totalPages = Math.ceil(total / l) || 1;

  const meta = {
    page: p,
    limit: l,
    total,
    totalPages,
  };

  return successResponse(res, message, data, 200, meta);
};

module.exports = {
  successResponse,
  errorResponse,
  paginateResponse,
};
