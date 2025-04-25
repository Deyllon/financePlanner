/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { firstValueFrom } from 'rxjs';
import { Bank } from './schema/bank.schema';
import { Model } from 'mongoose';
import { Account } from './schema/account.schema';
import { PrismaService } from '../prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BankNames } from '../utils/utils';
import { InjectQueue } from '@nestjs/bull';
import { Queue, JobOptions } from 'bull';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Prisma } from 'generated/prisma';

@Injectable()
export class BanksService {
  private readonly baseUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Bank.name) private bankModel: Model<Bank>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectQueue('transaction') private readonly bankQueue: Queue,
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
    this.baseUrl = this.configService.get<string>('PLUGGY_URL') as string;
  }

  async createItem(
    id: number,
    parameters: Record<string, string>,
    connectorId: number,
  ) {
    const apiKey = await this.getApiKey();
    const response = await firstValueFrom(
      this.httpService.post(
        this.baseUrl + '/items',
        {
          parameters: parameters,
          connectorId: connectorId,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        },
      ),
    );

    await this.bankModel.updateOne(
      { userId: id },
      { $push: { items: response.data } },
      { upsert: true },
    );
  }

  async createAccount(id: number, bankName: string) {
    const apiKey = await this.getApiKey();
    const bank = await this.bankModel.findOne({
      userId: id,
      items: {
        $elemMatch: {
          'connector.name': bankName,
        },
      },
    });

    const item = bank?.items.find((i) => i.connector.name === bankName);

    if (!item) {
      throw new Error('Item não encontrado para este banco.');
    }

    const response = await firstValueFrom(
      this.httpService.get(`${this.baseUrl}/accounts`, {
        params: {
          itemId: item?.id,
          type: 'BANK',
        },
        headers: {
          'X-API-KEY': apiKey,
        },
      }),
    );

    await this.accountModel.updateOne(
      { userId: id },
      {
        $push: {
          accounts: {
            bankName: bankName,
            accountId: response.data.results[0].id,
          },
        },
      },
      { upsert: true },
    );
  }

  async createTransaction(id: number, bankName: string) {
    const account = await this.accountModel.findOne({
      userId: id,
      accounts: {
        $elemMatch: {
          bankName: bankName,
        },
      },
    });

    const item = account?.accounts.find((i) => i.bankName === bankName);

    if (!item) {
      throw new NotFoundException('Conta não encontrada para este banco.');
    }

    return item;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const banks = BankNames;
    const pageSize = 100;
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const enqueueJobs: {
        name: string;
        data: any;
        opts?: Omit<JobOptions, 'repeat'>;
      }[] = [];

      const users = await this.prismaService.user.findMany({
        skip: page * pageSize,
        take: pageSize,
        select: {
          id: true,
          active: true,
        },
        where: {
          active: true,
        },
      });

      if (users.length === 0) {
        hasMore = false;
        break;
      }

      const apiKey = await this.getApiKey();

      for (const user of users) {
        for (const bank of banks) {
          enqueueJobs.push({
            name: 'transaction-job',
            data: {
              userId: user.id,
              bank,
              apiKey: apiKey,
            },
            opts: {
              attempts: 5,
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
              removeOnComplete: true,
            },
          });
        }
      }

      await this.bankQueue.addBulk(enqueueJobs);
      page++;
    }
  }

  private async getApiKey() {
    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/auth`, {
        clientId: this.configService.get<string>('CLIENT_ID'),
        clientSecret: this.configService.get<string>('CLIENT_SECRET'),
      }),
    );

    return response.data.apiKey;
  }
}
