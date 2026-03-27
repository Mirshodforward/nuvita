import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly prisma: PrismaService) {
    this.bot = new Telegraf(
      process.env.TELEGRAM_BOT_TOKEN || '8379782597:AAE4jSnqLDn9dVRkn4bUX2uGGtHsxFNJzZc'
    );
  }

  onModuleInit() {
    this.bot.start(async (ctx) => {
      const telegramUserId = String(ctx.from.id);
      const user = await this.prisma.user.findUnique({
        where: { userId: telegramUserId }
      });

      if (user) {
        return this.handleUserRole(ctx, user, user.number);
      }

      await ctx.reply(
        "Assalomu alaykum! Tizimdan foydalanish uchun telefon raqamingizni yuboring.",
        Markup.keyboard([Markup.button.contactRequest('📱 Raqamni yuborish')])
          .resize()
          .oneTime(),
      );
    });

    this.bot.on('contact', async (ctx) => {
      const contact = ctx.message.contact;
      let phoneNumber = contact.phone_number;

      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }

      const telegramUserId = String(ctx.from.id);
      const telegramUsername = ctx.from.username || null;
      const telegramFullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || null;

      let user = await this.prisma.user.findUnique({
        where: { number: phoneNumber },
      });

      const miniAppUrl = process.env.MINI_APP_URL || 'https://t.me/your_bot_username/app';

      if (user) {
        user = await this.prisma.user.update({
          where: { number: phoneNumber },
          data: {
            userId: telegramUserId,
            username: telegramUsername || user.username,
            fullName: user.fullName || telegramFullName,
          },
        });
        return this.handleUserRole(ctx, user, phoneNumber);
      } else {
        const registerUrl = `${miniAppUrl}?register=true&phone=${encodeURIComponent(phoneNumber)}&telegramId=${telegramUserId}&username=${encodeURIComponent(telegramUsername || '')}&fullName=${encodeURIComponent(telegramFullName || '')}`;
        await ctx.reply(
          "Siz yangi foydalanuvchisiz. Ro'yxatdan o'tish uchun quyidagi tugmani bosing va parol o'rnating:",
          Markup.inlineKeyboard([ Markup.button.webApp("Yangi profil ochish", registerUrl) ]),
        );
      }
    });

    // Handling inline buttons for COURIER
    this.bot.action(/got_order_(.+)/, async (ctx) => {
      const orderId = ctx.match[1];
      const order = await this.prisma.order.update({
        where: { orderId },
        data: { orderStatus: 'ON_THE_WAY' },
        include: { user: true }
      });

      // Update bot message
      await ctx.editMessageText(
        `✅ Buyurtma (#${order.id}) kuryer tomonidan olindi va yo'lda!\nMijoz: ${order.fullName}\nTel: ${order.contactNumber}\nManzil: ${order.address}`,
        Markup.inlineKeyboard([
          Markup.button.callback("📍 Mijozga topshirdim (Yetkazdim)", `delivered_${orderId}`)
        ])
      );

      // Notify User
      if (order.user.userId) {
        await this.bot.telegram.sendMessage(
          order.user.userId,
          `🛵 Sizning buyurtmangiz (#${order.id}) kuryer tomonidan olindi. Buyurtma yo'lda!`
        );
      }
    });

    this.bot.action(/delivered_(.+)/, async (ctx) => {
      const orderId = ctx.match[1];
      const order = await this.prisma.order.findUnique({ where: { orderId }});
      if (!order) return;

      if (order.paymentType === 'CASH' && order.paymentStatus !== 'PAID') {
         await ctx.editMessageText(
          `💰 Buyurtma yetkazildi (#${order.id}).\n\nDIQQAT! To'lov naqd pulda ko'rsatilgan.\nMijozdan ${order.summ + order.deliverySumm} so'm qabul qilib oling!`,
          Markup.inlineKeyboard([
            Markup.button.callback("💸 Naqd pulni oldim (Tugatish)", `cash_received_${orderId}`)
          ])
        );
      } else {
        await this.completeOrderDelivery(ctx, orderId);
      }
    });

    this.bot.action(/cash_received_(.+)/, async (ctx) => {
      const orderId = ctx.match[1];
      await this.prisma.order.update({
        where: { orderId },
        data: { paymentStatus: 'PAID' }
      });
      await this.completeOrderDelivery(ctx, orderId);
    });

    this.bot.action(/grade_(.+)_(.+)/, async (ctx) => {
      const orderId = ctx.match[1];
      const grade = parseInt(ctx.match[2], 10);
      await this.prisma.order.update({
        where: { orderId },
        data: { grade }
      });
      await ctx.editMessageText(`Siz yetkazib berish xizmatini ${grade} ⭐️ yulduz bilan baholadingiz. Bahoyingiz uchun rahmat!`);
    });

    this.bot.launch().catch((err) => this.logger.error('Telegram bot launch error:', err));

    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }

  private async completeOrderDelivery(ctx: any, orderId: string) {
    const order = await this.prisma.order.update({
      where: { orderId },
      data: { orderStatus: 'DELIVERED' },
      include: { user: true }
    });

    await ctx.editMessageText(`✅ Buyurtma (#${order.id}) muvaffaqiyatli topshirildi va jarayon yakunlandi.`);

    if (order.user.userId) {
      await this.bot.telegram.sendMessage(
        order.user.userId,
        `🎉 Sizning buyurtmangiz (#${order.id}) muvaffaqiyatli yetkazildi!\n\nIltimos, xizmatimizni baholang:`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback("1 ⭐️", `grade_${orderId}_1`),
            Markup.button.callback("2 ⭐️", `grade_${orderId}_2`),
            Markup.button.callback("3 ⭐️", `grade_${orderId}_3`),
            Markup.button.callback("4 ⭐️", `grade_${orderId}_4`),
            Markup.button.callback("5 ⭐️", `grade_${orderId}_5`),
          ]
        ])
      );
    }
  }

  public async notifyCourierNewOrder(telegramId: string, order: any) {
    try {
      let totalCount = 0;
      const productDetails = (order.productItems as any[]).map((p, index) => {
        totalCount += p.count;
        return `${index + 1}. ${p.name} - ${p.count} ta (${(p.price * p.count).toLocaleString()} so'm)`;
      }).join('\n');

      const text = `🚨 Sizga yangi buyurtma biriktirildi!\n\n🆔 Buyurtma ID: #${order.id}\n👤 Mijoz: ${order.fullName}\n📞 Tel: ${order.contactNumber}\n📍 Manzil: ${order.address}\n💳 To'lov turi: ${order.paymentType} \n\n📦 Tarkibi:\n${productDetails}\n\n📊 Umumiy dorilar soni: ${totalCount} ta\n💰 Umumiy hisob: ${(order.summ + order.deliverySumm).toLocaleString()} so'm (Yetkazish ichida)`;    
      
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback("📦 Ombordan oldim (Tasdiqlash)", `got_order_${order.orderId}`)]
      ]);

      await this.bot.telegram.sendMessage(telegramId, text, keyboard);
    } catch (e) {
        this.logger.error("Could not notify courier bot", e);
    }
  }

  public async notifyUserStatusOrMessage(telegramId: string, message: string) {
    try {
        await this.bot.telegram.sendMessage(telegramId, message);
    } catch (e) {
        this.logger.error("Could not notify user", e);
    }
  }

  private async handleUserRole(ctx: any, user: any, phoneNumber: string) {      
    if (user.role === 'ADMIN') {
      await ctx.reply(
        `Xush kelibsiz Admin, ${user.fullName || phoneNumber}!`,
        Markup.keyboard([['📊 Yangi buyurtmalar', '📦 Barcha buyurtmalar'], ['👥 Mijozlar', '🛵 Kuryerlar'], ['⚙️ Sozlamalar']]).resize()
      );
    } else if (user.role === 'COURIER') {
      await ctx.reply(
        `Xush kelibsiz Kuryer, ${user.fullName || phoneNumber}!`,
        Markup.keyboard([['📦 Yangi buyurtmalar', '✅ Yetkazilganlar'], ['👤 Mening profilim']]).resize()
      );
    } else {
      const miniAppUrl = process.env.MINI_APP_URL || 'https://t.me/your_bot_username/app';
      await ctx.reply(
        `Xush kelibsiz, ${user.fullName || phoneNumber}!\nXaridni davom ettirish uchun ilovaga kiring:`,
        Markup.inlineKeyboard([Markup.button.webApp("🚀 Nuvita do'koniga kirish", miniAppUrl)]),
      );
    }
  }
}
