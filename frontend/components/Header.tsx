"use client";

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "@/lib/api";
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Search, X, Menu, User, Heart, ChevronDown, FileText, LogOut } from 'lucide-react';
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
  const [savedCount, setSavedCount] = useState<number>(0);
  const [isTg, setIsTg] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
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

  const fetchSavedCount = async (t: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/saved/count`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      setSavedCount(res.data.count || 0);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          setToken(newToken);
          fetchSavedCount(newToken);
        }
      } else {
        console.error("Saved count fetch error", err);
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
        fetchSavedCount(t);
      }
    }

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("accessToken");
      if (currentToken) {
        fetchCart(currentToken);
        fetchSavedCount(currentToken);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Fetch cart and saved after TG auth
  useEffect(() => {
    if (token && isTg) {
      fetchCart(token);
      fetchSavedCount(token);
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

  // Click outside to close profile dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setProfile(null);
    setIsProfileDropdownOpen(false);
    router.push("/");
  };

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
  const userInitial = profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : profile?.number?.charAt(0) || "M";

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
              <Link href="/blog" className="hover:text-green-600 transition-colors">
                Blog
              </Link>
             
              <Link href="/contact" className="hover:text-green-600 transition-colors cursor-pointer">
                Kontaktlar
              </Link>
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

            {token && (
              <Link href="/selected" className="relative p-2 text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1 bg-gray-50 rounded-xl">
                <Heart size={22} />
                {savedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {savedCount}
                  </span>
                )}
              </Link>
            )}

            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 bg-gray-50 rounded-xl ml-1">     
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {token ? (
              <div className="relative ml-2" ref={profileDropdownRef}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 px-2 py-1.5 rounded-xl transition-colors shrink-0"
                  >
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm md:text-base ring-2 ring-white">
                      {profile?.photoUrl ? (
                        <img 
                          src={profile.photoUrl} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : userInitial}
                    </div>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                      <p className="font-semibold text-gray-900 truncate">
                        {displayName}
                      </p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link 
                        href="/profile" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <User size={18} />
                        <span className="font-medium text-sm">Profil</span>
                      </Link>
                      
                      <Link 
                        href="/orders" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <FileText size={18} />
                        <span className="font-medium text-sm">Mening buyurtmalarim</span>
                      </Link>

                      <Link 
                        href="/selected" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Heart size={18} />
                        <span className="font-medium text-sm">Sevimlilar</span>
                      </Link>
                    </div>
                    
                    <div className="p-2 border-t border-gray-100">
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <LogOut size={18} />
                        <span className="font-medium text-sm">Chiqish</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-medium transition-colors text-sm ml-2">
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
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-80 pb-3 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}>
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
              href="/blog" 
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm text-gray-700 font-medium transition-all"
            >
              Blog
            </Link>
            {token && (
              <Link 
                href="/selected" 
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm text-gray-700 font-medium transition-all flex items-center gap-2"
              >
                <Heart size={18} className="text-red-500" />
                Saqlanganlar
                {savedCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {savedCount}
                  </span>
                )}
              </Link>
            )}
            
            <Link 
              href="/contact" 
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
