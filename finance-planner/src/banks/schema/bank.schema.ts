import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BankDocument = HydratedDocument<Bank>;

@Schema()
export class Bank {
  @Prop()
  userId: number;

  @Prop()
  items: any[];
}

export const BankSchema = SchemaFactory.createForClass(Bank);
