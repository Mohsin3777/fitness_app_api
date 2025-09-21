export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  name?: string | null; // ✅ nullable name field
}

export class ResponseClass {
  static success<T>(
    data: T,
    message = "Success",
    statusCode = 200,
    name: string | null = null
  ): ApiResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      name, // ✅ will be null if not passed
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
      name, // ✅ can also be null here
    };
  }
}
