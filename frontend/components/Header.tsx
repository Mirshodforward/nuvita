"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { UserCircle, ShoppingCart, Search } from 'lucide-react';

interface UserProfile {
  id: number;
  number: string;
  fullName: string | null;
}

export function Header() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async (t: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/user/me`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      setProfile(res.data);
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {        
        localStorage.removeItem("accessToken");
        setToken(null);
      }
    }
  };

  const fetchCart = async (t: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      setCartCount(res.data.count || 0);
    } catch (err) {
      console.error("Cart fetch error", err);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (t) {
      setToken(t);
      fetchProfile(t);
      fetchCart(t);
    }

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("accessToken");
      if (currentToken) {
        fetchCart(currentToken);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
              <div className="relative">
                <button
                  onClick={() => router.push('/profile')}
                  className="p-2 text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2"
                >
                  <UserCircle size={28} />
                  <span className="font-medium hidden sm:block">{profile?.fullName || profile?.number || "Profil"}</span>
                </button>
              </div>
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
