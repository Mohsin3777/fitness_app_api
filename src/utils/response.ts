// utils/response.ts

// Pagination interface
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Generic API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    pagination?: Pagination | null;
    [key: string]: any; // 👈 allows dynamic keys like "exercise", "user", etc.
  };
}

// Options for success responses
export interface SuccessOptions<T> {
  result: T;
  message?: string;
  statusCode?: number;
  pagination?: Pagination | null;
  name?: string | null;
}

// Options for error responses
export interface ErrorOptions {
  message?: string;
  statusCode?: number;
  name?: string | null;
}

// Options for paginated responses
export interface PaginatedOptions<T> {
  result: T;
  total: number;
  page?: number;
  limit?: number;
  message?: string;
  statusCode?: number;
  name?: string | null;
}

export class ResponseClass {
  static success<T>({
    result,
    message = "Success",
    statusCode = 200,
    pagination = null,
    name = null,
  }: SuccessOptions<T>): ApiResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data: {
        pagination,
        ...(name ? { [name]: result } : { result }),
      },
    };
  }

  static error({
    message = "Something went wrong",
    statusCode = 500,
    name = null,
  }: ErrorOptions): ApiResponse {
    return {
      success: false,
      statusCode,
      message,
      data: {
        pagination: null,
        ...(name ? { [name]: null } : { result: null }),
      },
    };
  }

  static paginated<T>({
    result,
    total,
    page = 1,
    limit = 10,
    message = "Success",
    statusCode = 200,
    name = null,
  }: PaginatedOptions<T>): ApiResponse<T> {
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);

    return {
      success: true,
      statusCode,
      message,
      data: {
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit),
        },
        ...(name ? { [name]: result } : { result }),
      },
    };
  }
}
