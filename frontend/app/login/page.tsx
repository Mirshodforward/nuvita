"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const [phone, setPhone] = useState("+998");
  const [step, setStep] = useState<"phone" | "password">("phone");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // basic validation
    const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$|^\+998\d{9}$/;
    const cleanPhone = phone.replace(/\s+/g, "");

    if (!phoneRegex.test(cleanPhone)) {
      setError("Iltimos, O'zbekiston raqamini kiriting: +998 XX XXX XX XX");
      return;
    }

    setLoading(true);
    try {
      // call backend to check if user exists
      const res = await axios.post(`${API_BASE_URL}/auth/check-phone`, { number: cleanPhone });
      if (res.data.exists) {
        setStep("password");
      } else {
        router.push(`/register?phone=${encodeURIComponent(cleanPhone)}`);
      }
    } catch (err: any) {
        console.error(err);
      setError("Tizimda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanPhone = phone.replace(/\s+/g, "");
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { number: cleanPhone, password });
      
      // Save tokens
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      router.push("/profile");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Parol noto'g'ri kitirildi.");
      } else {
        setError("Tizimda xatolik. Qaytadan urinib ko'ring.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Tizimga kirish
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-900">
                Telefon raqam
              </label>
              <div className="mt-2">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
              >
                {loading ? "Tekshirilmoqda..." : "Davom etish"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
             <div>
              <label className="block text-sm/6 font-medium text-gray-900">
                Telefon raqam: {phone}
              </label>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Parol
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-600 sm:text-sm/6"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
              >
                {loading ? "Kirilmoqda..." : "Tizimga kirish"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}