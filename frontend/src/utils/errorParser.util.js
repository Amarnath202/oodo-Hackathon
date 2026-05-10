export const parseError = (error) => {
  if (!error) return 'Something went wrong. Please try again.';

  // Axios error with response
  if (error.response) {
    const { status, data } = error.response;

    // Try to get message from backend
    const message = data?.message || data?.error || data?.msg;
    const code = data?.code || data?.errorCode;

    // Map known error codes
    const codeMap = {
      REQUIRED: 'This field is required',
      INVALID_FORMAT: 'Invalid format',
      INVALID_CREDENTIALS: 'Incorrect email or password',
      NOT_FOUND: 'Account not found',
      ALREADY_EXISTS: 'Already exists with this information',
      WEAK_PASSWORD: 'Password does not meet requirements',
      TOKEN_EXPIRED: 'Session expired. Please log in again.',
      UNAUTHORIZED: 'You are not authorized to perform this action',
      BUDGET_EXCEEDED: 'Budget limit exceeded',
      SERVER_ERROR: 'Something went wrong. Please try again.',
    };

    if (code && codeMap[code]) return codeMap[code];
    if (message) return message;

    // HTTP status fallbacks
    const statusMap = {
      400: 'Invalid request. Please check your input.',
      401: 'Please log in to continue.',
      403: 'You do not have permission to do this.',
      404: 'The requested resource was not found.',
      409: 'This already exists.',
      422: 'Validation failed. Please check your input.',
      429: 'Too many requests. Please slow down.',
      500: 'Server error. Please try again later.',
      503: 'Service unavailable. Please try again later.',
    };

    return statusMap[status] || 'An unexpected error occurred.';
  }

  // Network error
  if (error.request) {
    return 'Network error. Please check your connection.';
  }

  // Other errors
  return error.message || 'An unexpected error occurred.';
};

export const parseFieldErrors = (error) => {
  if (!error?.response?.data?.errors) return {};

  const fieldErrors = {};
  const errors = error.response.data.errors;

  if (Array.isArray(errors)) {
    errors.forEach((err) => {
      if (err.field) {
        fieldErrors[err.field] = err.message || 'Invalid value';
      }
    });
  } else if (typeof errors === 'object') {
    Object.entries(errors).forEach(([field, message]) => {
      fieldErrors[field] = typeof message === 'string' ? message : message[0] || 'Invalid value';
    });
  }

  return fieldErrors;
};
