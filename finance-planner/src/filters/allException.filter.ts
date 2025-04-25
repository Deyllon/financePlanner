/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Inject,
  LoggerService,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaClientError } from 'src/utils/utils';
import { AxiosError } from 'axios';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'An unexpected error ocurred';

    console.log(exception);
    if (this.isPrismaClientError(exception)) {
      this.logger.error(
        `PrismaClientError ${exception.message} requestId ${request.headers['request-id'] as string} path : ${request.path} method: ${request.method}`,
        request.url,
        request.method,
      );
      if (exception instanceof Prisma.PrismaClientKnownRequestError) {
        const meta = exception.meta as { target?: string[] };
        const target = meta?.target?.join(', ');

        switch (exception.code) {
          case 'P2002':
            status = HttpStatus.CONFLICT;
            message = `Unique constraint failed on field: ${target}`;
            break;
          case 'P2025':
            status = HttpStatus.NOT_FOUND;
            message = 'Record not found';
            break;
          case 'P2003':
            status = HttpStatus.BAD_REQUEST;
            message = `Foreign key constraint failed on the field: ${target}`;
            break;
          case 'P2000':
            status = HttpStatus.BAD_REQUEST;
            message = `The provided value for the column is too long for the column's type: ${target}`;
            break;
          case 'P2011':
            status = HttpStatus.BAD_REQUEST;
            message = `Null constraint violation on the: ${target}`;
            break;
          case 'P2006':
            status = HttpStatus.BAD_REQUEST;
            message = `The provided value for ${target} is not valid`;
            break;
          default:
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message;
            break;
        }
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = exception.message;
      }
    }

    if (exception instanceof HttpException) {
      this.logger.error(
        `HttpException ${exception.message} requestId ${request.headers['request-id'] as string} path : ${request.path} method: ${request.method}`,
        request.url,
        request.method,
      );
      status = exception.getStatus();
      message = exception.message;
    }

    if (exception instanceof AxiosError) {
      this.logger.error(
        `AxiosError ${JSON.stringify(exception)}`,
        request.url,
        request.method,
      );
      status = exception.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.response?.data;
    }
    response.status(status).json({
      metadata: {
        timestamp: new Date().toISOString(),
        path: request.url,
        requestId: request.headers['request-id'] as string,
        statusCode: status,
        method: request.method,
      },
      data: {
        message,
      },
    });
  }

  private isPrismaClientError(error: unknown): error is PrismaClientError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError ||
      error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientUnknownRequestError
    );
  }
}
