"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { getTelegramWebApp, isTelegramMiniApp } from "@/lib/telegram";
import { CheckCircle, Lock, Phone, User } from "lucide-react";

function RegisterForm() {
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isTgMode, setIsTgMode] = useState(false);
  const [fullName, setFullName] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we're in TG registration mode
    const mode = searchParams.get("mode");
    const qPhone = searchParams.get("phone");
    const qFullName = searchParams.get("fullName");
    
    if (mode === "register" || qPhone) {
      setIsTgMode(true);
      if (qPhone) setPhone(qPhone);
      if (qFullName) setFullName(decodeURIComponent(qFullName));
    }

    // Tell TG WebApp we're ready
    if (isTelegramMiniApp()) {
      const webApp = getTelegramWebApp();
      webApp?.ready();
      webApp?.expand();
    }
  }, [searchParams]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Parollar mos kelmadi");
      return;
    }
    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s+/g, "");
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        number: cleanPhone,
        password,
        telegramId: searchParams.get("telegramId"),
        username: searchParams.get("username"),
        fullName: searchParams.get("fullName"),
      });

      // Save tokens
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      
      setSuccess(true);

      // If in TG Mini App, show success and close after delay
      if (isTelegramMiniApp()) {
        const webApp = getTelegramWebApp();
        webApp?.HapticFeedback?.notificationOccurred("success");
        
        setTimeout(() => {
          webApp?.close();
        }, 2000);
      } else {
        // Regular web - redirect to profile
        setTimeout(() => {
          router.push("/profile");
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        setError("Bu raqam orqali allaqachon ro'yxatdan o'tilgan.");
      } else {
        setError("Tizimda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12">
        <div className="bg-green-50 rounded-full p-6 mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Muvaffaqiyatli!
        </h2>
        <p className="text-gray-600 text-center">
          Ro'yxatdan o'tish yakunlandi.
          {isTelegramMiniApp() 
            ? " Telegram botga qaytishingiz mumkin." 
            : " Profilga yo'naltirilmoqda..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {isTgMode ? "Parol o'rnatish" : "Ro'yxatdan o'tish"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isTgMode 
              ? "Saytga kirish uchun parol yarating" 
              : "Yangi hisob yaratish"}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          {/* Phone number - readonly in TG mode */}
          <div>
            <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <Phone size={16} />
              Telefon raqam
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              required
              readOnly={isTgMode}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className={`block w-full rounded-xl bg-white px-4 py-3 text-base text-gray-900 border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isTgMode ? 'bg-gray-50 text-gray-600' : ''}`}
            />
          </div>

          {/* Full name - show in TG mode if available */}
          {fullName && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                <User size={16} />
                Ism
              </label>
              <input
                type="text"
                readOnly
                value={fullName}
                className="block w-full rounded-xl bg-gray-50 px-4 py-3 text-base text-gray-600 border border-gray-200"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <Lock size={16} />
              Parol
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kamida 6 ta belgi"
              className="block w-full rounded-xl bg-white px-4 py-3 text-base text-gray-900 border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
              <Lock size={16} />
              Parolni tasdiqlang
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Parolni qayta kiriting"
              className="block w-full rounded-xl bg-white px-4 py-3 text-base text-gray-900 border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center items-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Kutilmoqda...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                {isTgMode ? "Parolni saqlash" : "Ro'yxatdan o'tish"}
              </>
            )}
          </button>
        </form>

        {/* Info text for TG mode */}
        {isTgMode && (
          <p className="mt-6 text-center text-xs text-gray-500">
            Bu parol saytga kirishda ishlatiladi.
            <br />
            Telegram orqali avtomatik kirasiz.
          </p>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-full items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}