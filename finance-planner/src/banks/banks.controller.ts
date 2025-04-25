import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { BanksService } from './banks.service';
import { ConnectorId } from 'src/utils/utils';
import { ConnectorValidation } from 'src/pipes/connector.validation.pipe';
import { BankNameValidation } from 'src/pipes/bankname.validation.pipe';

@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}
  @Get('teste/transaction')
  transaction() {
    return this.banksService.handleCron();
  }

  @Post('/user/:id')
  createItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<any, any>,
    @Query('connectorName', ConnectorValidation) connectorId: ConnectorId,
  ) {
    return this.banksService.createItem(id, body, connectorId);
  }

  @Get('/account/user/:id')
  createAccount(
    @Param('id', ParseIntPipe) id: number,
    @Query('bank', BankNameValidation) bank: string,
  ) {
    return this.banksService.createAccount(id, bank);
  }
}
