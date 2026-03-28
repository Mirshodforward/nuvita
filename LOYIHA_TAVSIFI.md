# NUVITA - ONLINE DORIXONA LOYIHASI

## Loyiha Haqida Umumiy Ma'lumot

Nuvita - bu O'zbekiston bozori uchun mo'ljallangan zamonaviy online dorixona platformasi. Loyiha Telegram Mini App texnologiyasi asosida qurilgan bo'lib, foydalanuvchilarga dori-darmonlarni onlayn buyurtma qilish imkonini beradi. Platforma to'liq avtomatlashtirilgan buyurtma jarayoni, qulay to'lov tizimlari va tezkor yetkazib berish xizmatini taqdim etadi.

## Texnik Arxitektura

Loyiha zamonaviy full-stack arxitektura asosida qurilgan. Backend qismi NestJS framework yordamida TypeScript tilida yozilgan. Ma'lumotlar bazasi sifatida PostgreSQL ishlatiladi, Prisma ORM orqali ma'lumotlar bilan ishlash amalga oshiriladi. Frontend qismi Next.js 16 versiyasida Turbopack bilan qurilgan bo'lib, React komponentlari asosida ishlaydi.

Telegram integratsiyasi Telegraf kutubxonasi orqali amalga oshirilgan. Bot foydalanuvchilarni ro'yxatdan o'tkazish, buyurtma holati haqida xabar berish va kuryer bilan aloqa o'rnatish vazifalarini bajaradi.

## Foydalanuvchi Rollari

Tizimda uchta asosiy rol mavjud: oddiy foydalanuvchi (USER), administrator (ADMIN) va kuryer (COURIER). Har bir rol o'ziga xos funksionallikka ega.

Oddiy foydalanuvchilar mahsulotlarni ko'rish, savatga qo'shish va buyurtma berish imkoniyatiga ega. Ular Telegram bot orqali ro'yxatdan o'tishadi va telefon raqami bilan tizimga kirishadi.

Administratorlar mahsulotlarni boshqarish, kategoriyalar yaratish, buyurtmalarni kuzatish, xodimlarni qo'shish va tizim sozlamalarini o'zgartirish huquqiga ega. Admin panel web interfeys orqali ishlaydi.

Kuryerlar buyurtmalarni qabul qilish, yetkazish holati haqida xabar berish va mijozlarga mahsulotlarni topshirish vazifalarini bajaradi. Ular Telegram bot orqali barcha operatsiyalarni amalga oshiradi.

## Asosiy Funksionallik

Mahsulotlar kategoriyalar bo'yicha ajratilgan. Har bir mahsulot nomga, tavsifga, tarkibga, foydalanish ko'rsatmalariga, narxga va rasmga ega. Administrator mahsulotlarni faollashtirish yoki o'chirish imkoniyatiga ega.

Savat tizimi real vaqtda ishlaydi. Foydalanuvchi mahsulotni qo'shganda, miqdorini o'zgartirganda yoki o'chirganda, umumiy summa avtomatik hisoblanadi. Savat ma'lumotlari ma'lumotlar bazasida saqlanadi.

Buyurtma jarayoni bir necha bosqichdan iborat: savat tasdiqlash, yetkazib berish manzilini kiritish, to'lov usulini tanlash va buyurtmani yuborish. Tizim Payme, Click va naqd pul to'lov usullarini qo'llab-quvvatlaydi.

## Buyurtma Holatlari

Buyurtma quyidagi holatlardan o'tadi: YANGI (NEW), QABUL QILINGAN (ACCEPTED), YO'LDA (ON_THE_WAY), YETKAZILGAN (DELIVERED) va BEKOR QILINGAN (CANCELLED). Har bir holat o'zgarishi Telegram orqali mijozga xabar beriladi.

## Yetkazib Berish Tizimi

Administrator kuryerga buyurtmani biriktiradi. Kuryer Telegram bot orqali buyurtma haqida xabar oladi va uni tasdiqlaydi. Mahsulotni ombordan olgach, kuryer "Yo'lda" tugmasini bosadi. Mijozga topshirgandan so'ng, agar to'lov naqd bo'lsa, kuryer pulni qabul qiladi va buyurtmani yakunlaydi.

## Sozlamalar va Konfiguratsiya

Tizim sozlamalari admin panel orqali boshqariladi. Yetkazib berish narxi dinamik ravishda o'zgartirilishi mumkin. Barcha sozlamalar ma'lumotlar bazasida saqlanadi.

## Xavfsizlik

Autentifikatsiya JWT token asosida ishlaydi. Access token qisqa muddatli, refresh token uzoq muddatli. Parollar bcrypt algoritmi bilan shifrlangan. Telegram autentifikatsiyasi uchun WebApp initData tekshiriladi.

## Xulosa

Nuvita loyihasi zamonaviy texnologiyalar yordamida qurilgan, foydalanuvchilarga qulay va xavfsiz online dorixona xizmatini taqdim etadi. Telegram integratsiyasi orqali millionlab foydalanuvchilarga oson kirish imkoniyati yaratilgan.
