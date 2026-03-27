import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus;

  @IsNumber()
  @IsOptional()
  courierUserId?: number;
}
