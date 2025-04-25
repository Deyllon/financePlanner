import { $Enums, Prisma } from 'generated/prisma';
import { authSchema } from '../auth/dto/auth.schema';
import { goalSchema } from '../goals/dto/create-goal.schema';
import { updateGoalSchema } from '../goals/dto/update-goal.schema';
import { operationSchema } from '../operations/dto/create-operation.schema';
import { updateOperationSchema } from '../operations/dto/update-operation.schema';
import { userSchema } from '../user/dto/create.user.schema';
import { updateUserSchema } from '../user/dto/update.user.schema';
import { ZodNumber, ZodObject, ZodRawShape } from 'zod';

export const schemaMap = {
  'POST /user': userSchema,
  'PUT /user': updateUserSchema,
  'POST /operations': operationSchema,
  'PUT /operations': updateOperationSchema,
  'POST /goals': goalSchema,
  'PUT /goals': updateGoalSchema,
  'POST /auth': authSchema,
};

export type SchemaMap = typeof schemaMap;

export type SchemaKey = keyof SchemaMap;

export const extractFilters = <T extends ZodRawShape>(
  query: Record<string, string>,
  data: ZodObject<T>,
): Record<string, string | number> => {
  const shape = data.shape;

  return Object.fromEntries(
    Object.keys(shape)
      .filter((key) => query[key] !== undefined)
      .map((key) => {
        const fieldSchema = shape[key];

        // Converte para número se o tipo for z.number()
        if (fieldSchema instanceof ZodNumber) {
          const value = Number(query[key]);
          return [key, isNaN(value) ? query[key] : value];
        }

        return [key, query[key]];
      }),
  );
};

export type PrismaClientError =
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientValidationError
  | Prisma.PrismaClientRustPanicError
  | Prisma.PrismaClientInitializationError
  | Prisma.PrismaClientUnknownRequestError;

export interface JwtPayload {
  sub: number;
  username: string;
}

export type ReportType = {
  context: {
    date: Date;
    user: {
      id: number | undefined;
      name: string | undefined;
      email: string | undefined;
      profile: $Enums.Profile | undefined;
    };
    goals:
      | {
          name: string;
          value: number;
          deadline: Date;
        }[]
      | undefined;
    operations:
      | {
          value: number;
          type: $Enums.OperationType;
          date: Date;
          category: string;
        }[]
      | undefined;
    financeBalance: number;
  };
};

export enum ConnectorId {
  'Nubank' = 212,
  'Santander' = 208,
}

export const BankNames = ['Nubank', 'Santander'];
