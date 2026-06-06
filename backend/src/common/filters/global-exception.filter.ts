import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from "@nestjs/common";
import { DatabaseQueryError } from "../../database/mysql";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<{
      status: (statusCode: number) => { json: (body: unknown) => void };
    }>();
    const request = context.getRequest<{ method?: string; url?: string }>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const responseBody = exception.getResponse();
      response.status(statusCode).json(responseBody);
      return;
    }

    if (exception instanceof DatabaseQueryError) {
      const statusCode = exception.isSchemaMismatch
        ? HttpStatus.SERVICE_UNAVAILABLE
        : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = exception.isSchemaMismatch
        ? "Database schema is outdated or incompatible with the current server code."
        : "Database request failed.";

      this.logger.error(
        `${request?.method || "HTTP"} ${request?.url || ""} -> ${exception.code || "DB_ERROR"} ${exception.message} [${exception.query}]`,
        exception.stack
      );

      response.status(statusCode).json({
        statusCode,
        error: HttpStatus[statusCode],
        message
      });
      return;
    }

    const fallbackMessage = exception instanceof Error ? exception.message : String(exception);
    this.logger.error(
      `${request?.method || "HTTP"} ${request?.url || ""} -> Unhandled exception: ${fallbackMessage}`,
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
      message: "Internal server error."
    });
  }
}
