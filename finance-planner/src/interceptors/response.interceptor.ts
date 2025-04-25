// response-format.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseFormatInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data: unknown) => {
        return {
          metadata: {
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.headers['request-id'] as string,
            statusCode: response.status,
            method: request.method,
          },
          data,
        };
      }),
    );
  }
}
