import { Module } from '@nestjs/common';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { Bank, BankSchema } from './schema/bank.schema';
import { Account, AccountSchema } from './schema/account.schema';
import { PrismaService } from 'src/prisma.service';
import { BullModule } from '@nestjs/bull';
import { BankConsumer } from 'src/consumers/bank.consumer';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueueAsync({
      name: 'transaction',
    }),
    MongooseModule.forFeature([{ name: Bank.name, schema: BankSchema }]),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  controllers: [BanksController],
  providers: [BanksService, PrismaService, BankConsumer],
})
export class BanksModule {}
