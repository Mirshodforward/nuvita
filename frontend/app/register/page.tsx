"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { getTelegramWebApp, isTelegramMiniApp } from "@/lib/telegram";
import { CheckCircle, Lock, Phone, User, AlertCircle, Loader2 } from "lucide-react";

interface TokenData {
  phone: string;
  fullName: string;
  telegramId: string;
  username: string;
}

function RegisterForm() {
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isTgMode, setIsTgMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initializeForm = async () => {
      setInitialLoading(true);
      
      // Check for TG Mini App startapp parameter (token)
      if (isTelegramMiniApp()) {
        const webApp = getTelegramWebApp();
        webApp?.ready();
        webApp?.expand();
        
        const startParam = webApp?.initDataUnsafe?.start_param;
        
        if (startParam) {
          // Token-based registration
          setToken(startParam);
          setIsTgMode(true);
          
          try {
            const res = await axios.get<TokenData>(`${API_BASE_URL}/auth/register-token/${startParam}`);
            setPhone(res.data.phone);
            setFullName(res.data.fullName || '');
          } catch (err: any) {
            console.error('Token validation error:', err);
            setTokenError(err.response?.data?.message || "Havola yaroqsiz yoki muddati tugagan. Iltimos, botdan qaytadan /start bosing.");
          }
          
          setInitialLoading(false);
          return;
        }
      }

      // Fallback: Old query param mode
      const mode = searchParams.get("mode");
      const qPhone = searchParams.get("phone");
      const qFullName = searchParams.get("fullName");
      
      if (mode === "register" || qPhone) {
        setIsTgMode(true);
        if (qPhone) setPhone(qPhone);
        if (qFullName) setFullName(decodeURIComponent(qFullName));
      }
      
      setInitialLoading(false);
    };

    initializeForm();
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
      let res;
      
      if (token) {
        // Token-based registration (new secure way)
        res = await axios.post(`${API_BASE_URL}/auth/register-with-token`, {
          token,
          password,
        });
      } else {
        // Fallback: Old query param way
        const cleanPhone = phone.replace(/\s+/g, "");
        res = await axios.post(`${API_BASE_URL}/auth/register`, {
          number: cleanPhone,
          password,
          telegramId: searchParams.get("telegramId"),
          username: searchParams.get("username"),
          fullName: searchParams.get("fullName"),
        });
      }

      // Save tokens
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      
      setSuccess(true);

      // If in TG Mini App, redirect to main page after delay
      if (isTelegramMiniApp()) {
        const webApp = getTelegramWebApp();
        webApp?.HapticFeedback?.notificationOccurred("success");
        
        setTimeout(() => {
          router.push("/");
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
        const message = err.response?.data?.message || "";
        if (message.includes("Telegram")) {
          setError("Bu Telegram hisob allaqachon ro'yxatdan o'tgan. Iltimos, /start bosib qaytadan urinib ko'ring.");
        } else {
          setError("Bu raqam orqali allaqachon ro'yxatdan o'tilgan.");
        }
      } else if (err.response?.status === 404) {
        setError("Havola yaroqsiz yoki muddati tugagan.");
      } else {
        setError("Tizimda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial loading state
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center items-center px-6 py-12">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
        <p className="mt-4 text-gray-600 font-medium">Yuklanmoqda...</p>
      </div>
    );
  }

  // Token error state
  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col justify-center items-center px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="bg-red-100 rounded-full p-5 mb-6 mx-auto w-fit">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Xatolik
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {tokenError}
          </p>
          {isTelegramMiniApp() && (
            <button
              onClick={() => getTelegramWebApp()?.close()}
              className="mt-6 w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            >
              Yopish
            </button>
          )}
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center items-center px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="bg-green-100 rounded-full p-5 mb-6 mx-auto w-fit">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Muvaffaqiyatli!
          </h2>
          <p className="text-gray-600 text-sm">
            Ro'yxatdan o'tish yakunlandi.
          </p>
          <p className="text-green-600 text-sm font-medium mt-2">
            Asosiy sahifaga yo'naltirilmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-green-200">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {isTgMode ? "Parol o'rnatish" : "Ro'yxatdan o'tish"}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {isTgMode 
              ? "Saytga kirish uchun parol yarating" 
              : "Yangi hisob yaratish"}
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 p-6 sm:p-8 border border-gray-100">
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            {/* Phone number - readonly in TG mode */}
            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <Phone size={16} className="text-green-600" />
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
                className={`block w-full rounded-xl px-4 py-3.5 text-base text-gray-900 border-2 placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors ${isTgMode ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed' : 'bg-white border-gray-200 focus:border-green-500'}`}
              />
            </div>

            {/* Full name - show in TG mode if available */}
            {fullName && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <User size={16} className="text-green-600" />
                  Ism
                </label>
                <input
                  type="text"
                  readOnly
                  value={fullName}
                  className="block w-full rounded-xl bg-gray-50 px-4 py-3.5 text-base text-gray-600 border-2 border-gray-200 cursor-not-allowed"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <Lock size={16} className="text-green-600" />
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
                className="block w-full rounded-xl bg-white px-4 py-3.5 text-base text-gray-900 border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <Lock size={16} className="text-green-600" />
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
                className="block w-full rounded-xl bg-white px-4 py-3.5 text-base text-gray-900 border-2 border-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-green-200 hover:from-green-600 hover:to-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
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
            <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-center text-xs text-blue-700">
                <span className="font-medium">💡 Eslatma:</span> Bu parol saytga kirishda ishlatiladi.
                Telegram orqali avtomatik kirasiz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
