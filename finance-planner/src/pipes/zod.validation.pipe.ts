import {
  Injectable,
  PipeTransform,
  BadRequestException,
  Scope,
  Inject,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { schemaMap } from 'src/utils/utils';
import { ZodError } from 'zod';

@Injectable({ scope: Scope.REQUEST })
export class ZodValidationPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  transform(value: unknown) {
    try {
      if (typeof value !== 'object') {
        return value;
      }

      const routeKey = `${this.request.method} ${this.request.path}`;

      const route =
        routeKey.split(' ')[0] + ' /' + this.request.path.split('/')[1];

      if (routeKey.startsWith('POST /banks')) {
        return value;
      }

      if (routeKey.startsWith('GET') || routeKey.startsWith('DELETE')) {
        return value;
      }
      if (!(route in schemaMap)) {
        throw new BadRequestException(`No schema defined for route ${route}`);
      }
      const schema = schemaMap[route as keyof typeof schemaMap];

      if (!schema) {
        throw new BadRequestException(`No schema defined for route ${route}`);
      }

      return schema.parse(value);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }
      const message =
        error instanceof Error ? error.message : 'Validation failed';
      throw new BadRequestException({ message });
    }
  }
}
