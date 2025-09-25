export const extractErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === 'object' && 'message' in (error as Record<string, unknown>)) {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
};
