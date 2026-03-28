"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "@/lib/api";
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Search } from 'lucide-react';
import { isTelegramMiniApp, getTelegramInitData, getTelegramUser, getTelegramWebApp } from '@/lib/telegram';

interface UserProfile {
  id: number;
  number: string;
  userId?: string | null;
  fullName: string | null;
  username?: string | null;
  email?: string | null;
  address?: string | null;
  photoUrl?: string | null;
}

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    const newAccessToken = res.data.accessToken;
    const newRefreshToken = res.data.refreshToken;
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    return newAccessToken;
  } catch {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
};

export function Header() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isTg, setIsTg] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const router = useRouter();
  const pathname = usePathname();

  // Telegram Mini App authentication
  const authenticateWithTelegram = async () => {
    const initData = getTelegramInitData();
    if (!initData) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/telegram`, { initData });
      const { accessToken, refreshToken, user } = res.data;
      
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // Save full user data for profile page
      localStorage.setItem("tgUserData", JSON.stringify(user));
      setToken(accessToken);
      
      // Set profile with all data from backend
      setProfile({
        id: user.id,
        number: user.number,
        userId: user.userId,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        address: user.address,
        photoUrl: user.photoUrl,
      });

      // Tell TG WebApp we're ready
      const webApp = getTelegramWebApp();
      webApp?.ready();
      webApp?.expand();
    } catch (error) {
      console.error("TG auth error:", error);
    }
  };

  const fetchProfile = async (t: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user/me`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      setProfile(res.data);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          setToken(newToken);
          fetchProfile(newToken);
        } else {
          setToken(null);
        }
      }
    }
  };

  const fetchCart = async (t: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      setCartCount(res.data.count || 0);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          setToken(newToken);
          fetchCart(newToken);
        }
      } else {
        console.error("Cart fetch error", err);
      }
    }
  };

  useEffect(() => {
    // Check if we're in Telegram Mini App
    const inTg = isTelegramMiniApp();
    setIsTg(inTg);

    if (inTg) {
      // Auto-authenticate with Telegram
      authenticateWithTelegram();
    } else {
      // Normal web authentication
      const t = localStorage.getItem("accessToken");
      if (t) {
        setToken(t);
        fetchProfile(t);
        fetchCart(t);
      }
    }

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("accessToken");
      if (currentToken) {
        fetchCart(currentToken);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Fetch cart after TG auth
  useEffect(() => {
    if (token && isTg) {
      fetchCart(token);
    }
  }, [token, isTg]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {       
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push(`/`);
    }
  };

  // Get display name
  const displayName = profile?.fullName || profile?.number || "Profil";

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 rounded-b-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center shrink-0">
            <Link href="/" className="text-2xl font-bold text-green-600">       
              Nuvita
            </Link>
          </div>
          
          <div className="flex-1 max-w-xl hidden sm:block">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Mahsulot qidirish..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600">
                <Search size={18} />
              </button>
            </form>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 bg-gray-50 rounded-xl">     
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {token ? (
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {profile?.photoUrl ? (
                  <img 
                    src={profile.photoUrl} 
                    alt="Profile" 
                    className="w-9 h-9 rounded-full object-cover border-2 border-green-500"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="font-medium text-sm text-gray-800 leading-tight">
                    {displayName}
                  </span>
                  {profile?.username && (
                    <span className="text-xs text-gray-500 leading-tight">
                      @{profile.username}
                    </span>
                  )}
                </div>
              </button>
            ) : (
              <Link href="/login" className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-medium transition-colors text-sm sm:text-base">
                Kirish
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Search - Visible only on small screens */}
        <div className="block sm:hidden pb-3">
           <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Mahsulot qidirish..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600">
                <Search size={18} />
              </button>
            </form>
        </div>
      </div>
    </header>
  );
}
