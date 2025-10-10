import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Custom validation pipe with detailed error messages
 */
@Injectable()
export class CustomValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        const constraints = error.constraints;
        if (constraints) {
          return Object.values(constraints).join(', ');
        }
        return `Invalid value for ${error.property}`;
      });

      throw new BadRequestException({
        success: false,
        error: 'Validation failed',
        message: messages.join('; '),
        details: errors.map((error) => ({
          property: error.property,
          constraints: error.constraints,
        })),
      });
    }

    return object;
  }

  private toValidate(metatype: unknown): boolean {
    const types: Array<new (...args: unknown[]) => unknown> = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !types.includes(metatype as new (...args: unknown[]) => unknown);
  }
}
