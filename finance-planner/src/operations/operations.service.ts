import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateOperationDto } from './dto/create-operation.schema';
import { UpdateOperationDto } from './dto/update-operation.schema';
import { PrismaService } from '../prisma.service';
import { Prisma } from 'generated/prisma';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class OperationsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    prismaService.$on('error', (event: Prisma.LogEvent) => {
      this.logger.error('Prisma message error: ' + event.message);
      this.logger.error('Prisma Target: ' + event.target);
    });

    prismaService.$on('query', (event: Prisma.QueryEvent) => {
      this.logger.log('Prisma query: ' + event.query);
      this.logger.log('Prisma target: ' + event.target);
      this.logger.log('Prisma duration: ' + event.duration + 'ms');
      this.logger.log('Prisma params:' + event.params);
    });
  }
  async create(createOperationDto: CreateOperationDto) {
    const data = await this.prismaService.operation.create({
      data: {
        user_id: createOperationDto.user_id,
        value: createOperationDto.value,
        date: new Date(createOperationDto.date),
        type: createOperationDto.type,
        category: createOperationDto.category,
        operationId: createOperationDto.operationId,
      },
      select: {
        id: true,
        user_id: true,
        value: true,
        date: true,
        type: true,
        category: true,
      },
    });
    return data;
  }

  findAll(
    page: number,
    limit: number,
    filters: Record<string, string | number>,
  ) {
    return this.prismaService.operation.findMany({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number) {
    return this.prismaService.operation.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        value: true,
        date: true,
        type: true,
        category: true,
      },
    });
  }

  async update(id: number, updateOperationDto: UpdateOperationDto) {
    const data = await this.prismaService.operation.update({
      where: { id },
      data: updateOperationDto,
      select: {
        type: true,
        value: true,
        date: true,
        category: true,
      },
    });

    return data;
  }

  async remove(id: number) {
    const data = this.prismaService.operation.delete({
      where: { id },
    });

    return data;
  }
}
