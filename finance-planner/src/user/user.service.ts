import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.schema';
import { UpdateUserDto } from './dto/update.user.schema';
import { PrismaService } from '../prisma.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Prisma } from 'generated/prisma';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
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

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      parseInt(this.configService.get<string>('SALT') as string),
    );
    const data = await this.prismaService.user.create({
      data: { ...createUserDto, password: hashedPassword },
      select: {
        id: true,
        profile: true,
        email: true,
        name: true,
      },
    });
    return data;
  }

  findAll(
    page: number,
    limit: number,
    filters: Record<string, string | number>,
  ) {
    return this.prismaService.user.findMany({
      where: filters,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data = await this.prismaService.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        name: true,
        email: true,
        profile: true,
        active: true,
        id: true,
      },
    });

    return data;
  }

  async remove(id: number) {
    const data = await this.prismaService.user.update({
      where: { id },
      data: { active: false },
      select: {
        name: true,
        email: true,
        profile: true,
        active: true,
      },
    });

    return data;
  }
}
