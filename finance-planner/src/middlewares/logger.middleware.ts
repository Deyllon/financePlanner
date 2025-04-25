import {
  Inject,
  Injectable,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}
  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const url = req.originalUrl;
    const body = JSON.stringify(req.body);
    const headers = req.headers;
    const requestId: string = headers['request-id'] as string;
    if (method === 'POST' || method === 'PUT') {
      this.logger.log(
        `Request: ${method} for ${url} with Body: ${body} and requestId ${requestId}`,
      );
    } else {
      this.logger.log(
        `Request: ${method} for ${url} and requestId ${requestId}`,
      );
    }

    next();
  }
}
