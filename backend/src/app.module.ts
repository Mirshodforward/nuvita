import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './telegram/telegram.module';
import { CategoryModule } from './admin/category/category.module';
import { ProductModule } from './admin/product/product.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { StaffModule } from './admin/staff/staff.module';
import { SettingsModule } from './admin/settings/settings.module';

import { SettingsController } from './settings.controller';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    TelegramModule,
    CategoryModule,
    ProductModule,
    UserModule,
    CartModule,
    OrderModule,
    StaffModule,
    SettingsModule,
  ],
  controllers: [AppController, SettingsController],
  providers: [AppService],
})
export class AppModule {}
