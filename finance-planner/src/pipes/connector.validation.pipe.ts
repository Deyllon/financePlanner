import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ConnectorId } from 'src/utils/utils';

@Injectable()
export class ConnectorValidation implements PipeTransform {
  transform(value: unknown) {
    const validValues = Object.values(ConnectorId).filter(
      (v) => typeof v === 'number',
    );
    if (typeof value !== 'string' || !isNaN(Number(value))) {
      throw new BadRequestException(
        `Invalid connector name. Must be a string like 'Nubank' or 'Santander'.`,
      );
    }

    if (!(value in ConnectorId)) {
      throw new BadRequestException(
        `Invalid connectorId. Allowed values: ${validValues.join(', ')}`,
      );
    }

    return ConnectorId[value as keyof typeof ConnectorId];
  }
}
