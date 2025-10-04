// utils/response.ts
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    pagination?: Pagination | null;
    result?: T | null;
  };
  name?: string | null;
}

export class ResponseClass {
  static success<T>(
    result: T,
    message = "Success",
    statusCode = 200,
    pagination: Pagination | null = null,
    name: string | null = null
  ): ApiResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data: {
        pagination,
        result,
      },
      name,
    };
  }

  static error(
    message = "Something went wrong",
    statusCode = 500,
    name: string | null = null
  ): ApiResponse {
    return {
      success: false,
      statusCode,
      message,
      data: {
        pagination: null,
        result: null,
      },
      name,
    };
  }

  // convenience helper for paginated responses
  static paginated<T>(
    result: T,
    total: number,
    page = 1,
    limit = 10,
    message = "Success",
    statusCode = 200,
    name: string | null = null
  ): ApiResponse<T> {
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    return this.success(
      result,
      message,
      statusCode,
      {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
      name
    );
  }
}
