import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
