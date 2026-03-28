import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramService.name);
  private readonly MINI_APP_URL: string;
  private readonly WEBSITE_URL = 'https://nuvita.uz';

  constructor(private readonly prisma: PrismaService) {
    this.bot = new Telegraf(
      process.env.TELEGRAM_BOT_TOKEN || '8379782597:AAE4jSnqLDn9dVRkn4bUX2uGGtHsxFNJzZc'
    );
    this.MINI_APP_URL = process.env.MINI_APP_URL || 'https://t.me/nuvitauzbot/nuvitauz';
  }

  onModuleInit() {
    // /start command handler
    this.bot.start(async (ctx) => {
      const telegramUserId = String(ctx.from.id);
      
      // Check if user is registered by TG userId
      const user = await this.prisma.user.findUnique({
        where: { userId: telegramUserId }
      });

      if (user) {
        // User is registered - show welcome message based on role
        return this.handleRegisteredUser(ctx, user);
      }

      // User not registered - ask for contact
      await ctx.reply(
        "👋 Assalomu alaykum!\n\n🏥 Nuvita online dorixonasiga xush kelibsiz!\n\nTizimdan foydalanish uchun telefon raqamingizni yuboring:",
        Markup.keyboard([
          [Markup.button.contactRequest('📱 Telefon raqamni yuborish')]
        ]).resize().oneTime()
      );
    });

    // Contact handler
    this.bot.on('contact', async (ctx) => {
      const contact = ctx.message.contact;
      let phoneNumber = contact.phone_number;

      // Normalize phone number
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }

      const telegramUserId = String(ctx.from.id);
      const telegramUsername = ctx.from.username || null;
      const telegramFullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ') || null;

      // Check if user exists with this phone number
      let user = await this.prisma.user.findUnique({
        where: { number: phoneNumber },
      });

      if (user) {
        // Phone exists in DB - link TG account and welcome
        user = await this.prisma.user.update({
          where: { number: phoneNumber },
          data: {
            userId: telegramUserId,
            username: telegramUsername || user.username,
            fullName: user.fullName || telegramFullName,
          },
        });
        
        await ctx.reply(
          `✅ Telegram hisobingiz muvaffaqiyatli bog'landi!`,
          Markup.removeKeyboard()
        );
        
        return this.handleRegisteredUser(ctx, user);
      }

      // New user - redirect to Mini App for password setup
      const registerParams = new URLSearchParams({
        mode: 'register',
        phone: phoneNumber,
        telegramId: telegramUserId,
        username: telegramUsername || '',
        fullName: telegramFullName || '',
      });

      await ctx.reply(
        `📝 Siz yangi foydalanuvchisiz!\n\nRo'yxatdan o'tish uchun parol o'rnating.\nBu parol saytga kirishda ishlatiladi.`,
        Markup.removeKeyboard()
      );

      await ctx.reply(
        `👇 Quyidagi tugmani bosib parol o'rnating:`,
        Markup.inlineKeyboard([
          [Markup.button.webApp("🔐 Parol o'rnatish", `${this.MINI_APP_URL}?${registerParams.toString()}`)]
        ])
      );
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
    return this.handleRegisteredUser(ctx, user);
  }

  private async handleRegisteredUser(ctx: any, user: any) {      
    const displayName = user.fullName || user.number;
    
    if (user.role === 'ADMIN') {
      await ctx.reply(
        `🔑 Xush kelibsiz, Admin ${displayName}!`,
        Markup.keyboard([
          ['📊 Yangi buyurtmalar', '📦 Barcha buyurtmalar'],
          ['👥 Mijozlar', '🛵 Kuryerlar'],
          ['⚙️ Sozlamalar']
        ]).resize()
      );
    } else if (user.role === 'COURIER') {
      await ctx.reply(
        `🛵 Xush kelibsiz, Kuryer ${displayName}!`,
        Markup.keyboard([
          ['📦 Yangi buyurtmalar', '✅ Yetkazilganlar'],
          ['👤 Mening profilim']
        ]).resize()
      );
    } else {
      // Regular USER - show inline button to mini app
      await ctx.reply(
        `🎉 Xush kelibsiz, ${displayName}!\n\n🏥 Nuvita online dorixonasiga xush kelibsiz!\n\nBizda sifatli dori-darmonlar va shifokorlar maslahatlarini olishingiz mumkin.`,
        Markup.inlineKeyboard([
          [Markup.button.webApp("🛒 Boshla", this.MINI_APP_URL)],
          [Markup.button.url("🌐 Saytga o'tish", this.WEBSITE_URL)]
        ])
      );
    }
  }
}
