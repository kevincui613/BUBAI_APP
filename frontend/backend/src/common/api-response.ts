export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export function ok<T>(data: T, message = 'success'): ApiResponse<T> {
  return {
    code: 0,
    message,
    data,
  };
}
