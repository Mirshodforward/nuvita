import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('check-phone')
  checkPhone(@Body('number') number: string) {
    return this.authService.checkPhone(number);
  }

  @Post('register')
  register(@Body() body: any) {
    const telegramData = {
      userId: body.telegramId,
      username: body.username,
      fullName: body.fullName,
    };
    return this.authService.register(body.number, body.password, telegramData);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.number, body.password);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Post('telegram')
  telegramAuth(@Body('initData') initData: string) {
    return this.authService.telegramAuth(initData);
  }
}
