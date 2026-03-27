import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async checkPhone(number: string) {
    const user = await this.prisma.user.findUnique({ where: { number } });
    return { exists: !!user };
  }

  async register(
    number: string,
    passwordString: string,
    telegramData?: { userId?: string; username?: string; fullName?: string },
  ) {
    const existing = await this.prisma.user.findUnique({ where: { number } });
    if (existing) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    const hashedPassword = await bcrypt.hash(passwordString, 10);
    const user = await this.prisma.user.create({
      data: {
        number,
        password: hashedPassword,
        userId: telegramData?.userId || null,
        username: telegramData?.username || null,
        fullName: telegramData?.fullName || null,
      },
    });

    return this.generateTokens(user.id, user.number);
  }

  async login(number: string, passwordString: string) {
    const user = await this.prisma.user.findUnique({ where: { number } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(passwordString, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.number);
  }

  private async generateTokens(userId: number, number: string) {
    const payload = { sub: userId, number };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Save refresh token to db
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  }
}
