"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold text-white mb-4 block">
              Nuvita
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              O'zbekistondagi ishonchli online dorixona. Sifatli dori vositalari va tez yetkazib berish xizmati.
            </p>
            <a
              href="https://t.me/nuvitauzbot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <MessageCircle size={16} />
              Telegram bot
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Sahifalar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Asosiy sahifa
                </Link>
              </li>
              <li>
                <Link href="/?catalog=true" className="hover:text-green-400 transition-colors">
                  Katalog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-green-400 transition-colors">
                  Biz haqimizda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-green-400 transition-colors">
                  Kontaktlar
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold mb-4">Yordam</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-green-400 transition-colors">
                  Tez-tez so'raladigan savollar
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-green-400 transition-colors">
                  Yetkazib berish shartlari
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-green-400 transition-colors">
                  To'lov usullari
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-green-400 transition-colors">
                  Mahsulotni qaytarish
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Aloqa</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-green-400" />
                <a href="tel:+998901234567" className="hover:text-green-400 transition-colors">
                  +998 90 123 45 67
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-green-400" />
                <a href="mailto:info@nuvita.uz" className="hover:text-green-400 transition-colors">
                  info@nuvita.uz
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-green-400 mt-0.5" />
                <span>Toshkent shahri, Chilonzor tumani</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Nuvita.uz. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Click</span>
            <span>Payme</span>
            <span>Naqd pul</span>
          </div>
        </div>
      </div>
    </footer>
  );
}