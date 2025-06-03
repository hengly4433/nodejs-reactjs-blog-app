import { Response } from 'express';

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

class ResponseHandler {
  /**
   * 1) Change the `message` parameter from a single literal to a plain `string`.
   * 2) Keep `statusCode` as a `number` (default 200).
   */
  public static success<T>(
    res: Response,
    data: T,
    message: string = 'Request successful',
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  public static paginated<T>(
    res: Response,
    result: PaginatedResult<T>,
    message: string = 'Request successful'
  ) {
    return res.status(200).json({
      success: true,
      message,
      page: result.page,
      limit: result.limit,
      total: result.total,
      data: result.data,
    });
  }

  public static error(
    res: Response,
    message: string = 'Internal server error',
    statusCode: number = 500
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export default ResponseHandler;
