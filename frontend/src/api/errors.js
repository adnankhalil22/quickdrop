export function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.';
}

export function getValidationErrors(error) {
  return error.response?.data?.errors || {};
}
