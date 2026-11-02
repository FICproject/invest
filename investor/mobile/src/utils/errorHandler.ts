import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown, fallbackMessage = 'An unexpected error occurred.'): string => {
  if (!error) return fallbackMessage;

  if (typeof error === 'string') {
    return error;
  }

  const axiosError = error as AxiosError<{ message?: string; error?: string }>;

  if (axiosError.response && axiosError.response.data) {
    if (axiosError.response.data.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response.data.error) {
      return axiosError.response.data.error;
    }
  }

  if (axiosError.message) {
    if (axiosError.message.includes('Network Error')) {
      return 'Unable to reach the server. Please check your network connection and server status.';
    }
    return axiosError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};
