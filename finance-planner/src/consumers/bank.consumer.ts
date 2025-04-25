/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { Inject, LoggerService, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BanksService } from 'src/banks/banks.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Processor('transaction')
export class BankConsumer {
  private readonly baseUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bankService: BanksService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('PLUGGY_URL') as string;
  }

  @Process('transaction-job')
  async handleRequest(
    job: Job<{ bank: string; userId: number; apiKey: string }>,
  ) {
    try {
      console.log('sklsk');
      const item = await this.bankService.createTransaction(
        job.data.userId,
        job.data.bank,
      );

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transactions`, {
          params: {
            accountId: item?.accountId,

            from: new Date(new Date().setDate(new Date().getDate() - 20))
              .toISOString()
              .split('T')[0],
            to: new Date().toISOString().split('T')[0],
            pageSize: 50,
          },
          headers: {
            'X-API-KEY': job.data.apiKey,
          },
        }),
      );

      const operations = response.data.results.map((x) => {
        return {
          category: x.category,
          date: x.date,
          value: x.amount,
          type: x.type,
          user_id: job.data.userId,
          operationId: x.id,
        };
      });
      await this.prismaService.operation.createMany({
        data: operations,
        skipDuplicates: true,
      });
    } catch (e: unknown) {
      if (e instanceof NotFoundException) {
        return;
      }
      this.logger.error(e);
      throw e;
    }
  }
}
