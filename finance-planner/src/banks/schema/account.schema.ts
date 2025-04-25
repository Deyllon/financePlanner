import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

@Schema()
export class Account {
  @Prop()
  userId: number;

  @Prop({ type: [{ bankName: String, accountId: String }] })
  accounts: { bankName: string; accountId: string }[];
}

export const AccountSchema = SchemaFactory.createForClass(Account);
