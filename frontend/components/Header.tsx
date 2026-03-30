"use client";

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "@/lib/api";
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Search, X, Menu, User } from 'lucide-react';
import { isTelegramMiniApp, getTelegramInitData, getTelegramWebApp } from '@/lib/telegram';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
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
      localStorage.setItem("tgUserData", JSON.stringify(user));
      setToken(accessToken);
      
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

  // Main initialization
  useEffect(() => {
    const inTg = isTelegramMiniApp();
    setIsTg(inTg);

    if (inTg) {
      authenticateWithTelegram();
    } else {
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

  // Scroll handler for collapsing search
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 50 && isSearchOpen) {
        setIsSearchOpen(false);
      }
      setIsScrolled(scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    } else {
      router.push(`/`);
    }
  };

  const toggleSearch = () => {
    setIsSearchOpen(prev => !prev);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
    if (isSearchOpen) setIsSearchOpen(false);
  };

  // Hide header on admin/profile pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {       
    return null;
  }

  const displayName = profile?.fullName || profile?.number || "Profil";

  return (
    <header className={`bg-white/95 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 gap-3">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center shrink-0 gap-2">
            <button 
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors bg-gray-50 rounded-xl"
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="text-2xl font-bold text-green-600 mr-2 md:mr-6">       
              Nuvita
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/" className="hover:text-green-600 transition-colors">
                Asosiy
              </Link>
              <Link href="/catalog" className="hover:text-green-600 transition-colors">
                Katalog
              </Link>
             
              <a href="#contact" className="hover:text-green-600 transition-colors cursor-pointer">
                Kontaktlar
              </a>
            </nav>
          </div>
          
          {/* Desktop Search */}
          <div className="flex-1 max-w-md hidden lg:block mx-4">
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

          {/* Right side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile search icon */}
            <div className="flex md:hidden items-center gap-1">
              <button 
                onClick={toggleSearch}
                className="p-2 text-gray-600 hover:text-green-600 transition-colors bg-gray-50 rounded-xl"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            </div>

            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 bg-gray-50 rounded-xl ml-1">     
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {token ? (
              <button
                onClick={() => router.push('/profile')}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {profile?.photoUrl ? (
                  <img 
                    src={profile.photoUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-gray-600" />
                )}
              </button>
            ) : (
              <Link href="/login" className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-medium transition-colors text-sm">
                Kirish
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Search - Expandable */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? 'max-h-16 pb-3 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}>
          <form onSubmit={handleSearch} className="relative">
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Mahsulot qidirish..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-4 pr-20 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
              <button type="submit" className="p-1.5 text-gray-500 hover:text-green-600 bg-white rounded-full shadow-sm">
                <Search size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Menu - Expandable */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-60 pb-3 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}>
          <nav className="flex flex-col space-y-1 bg-gray-50 rounded-2xl p-2 border border-gray-100">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm text-gray-700 font-medium transition-all"
            >
              Asosiy sahifa
            </Link>
            <Link 
              href="/catalog" 
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm text-gray-700 font-medium transition-all"
            >
              Katalog
            </Link>
            
            <Link 
              href="#contact" 
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm text-gray-700 font-medium transition-all"
            >
              Kontaktlar
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
