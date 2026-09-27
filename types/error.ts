export interface ApiErrorResponse {
  response?: {
    data?: {
      email?: string;
      detail?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
  name?: string;
  status: number;
}
