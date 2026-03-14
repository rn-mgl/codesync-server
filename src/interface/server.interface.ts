interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
}

export type ServerResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;
