import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { BankNames } from 'src/utils/utils';

@Injectable()
export class BankNameValidation implements PipeTransform {
  transform(value: unknown) {
    if (typeof value !== 'string' || !isNaN(Number(value))) {
      throw new BadRequestException(
        `Invalid type for BankName Name. Allowed values: ${BankNames.join(', ')}`,
      );
    }

    const match = BankNames.filter((x) => x === value);

    if (!match) {
      throw new BadRequestException(
        `Invalid connectorId. Allowed values: ${BankNames.join(', ')}`,
      );
    }

    return match[0];
  }
}
