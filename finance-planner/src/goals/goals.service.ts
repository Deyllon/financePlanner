import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.schema';
import { UpdateGoalDto } from './dto/update-goal.schema';
import { PrismaService } from '../prisma.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Prisma } from 'generated/prisma';

@Injectable()
export class GoalsService {
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

  async create(createGoalDto: CreateGoalDto) {
    const data = await this.prismaService.goal.create({
      data: {
        user_id: createGoalDto.user_id,
        value: createGoalDto.value,
        deadline: new Date(createGoalDto.deadline),
        name: createGoalDto.name,
      },
    });
    return data;
  }

  findAll(
    page: number,
    limit: number,
    filters: Record<string, string | number>,
  ) {
    return this.prismaService.goal.findMany({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number) {
    return this.prismaService.goal.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateGoalDto: UpdateGoalDto) {
    const data = await this.prismaService.goal.update({
      where: { id },
      data: updateGoalDto,
    });

    return data;
  }

  async remove(id: number) {
    const data = this.prismaService.goal.delete({
      where: { id },
    });

    return data;
  }
}
