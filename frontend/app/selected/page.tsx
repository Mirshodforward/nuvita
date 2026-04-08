"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft, Trash2, ShoppingCart, Package } from "lucide-react";
import { getTelegramWebApp, isTelegramMiniApp } from "@/lib/telegram";

interface Product {
  id: number;
  productId: string;
  name: string;
  photos: string[];
  price: number;
  category: string;
  description?: string;
}

interface SavedItem {
  id: number;
  savedAt: string;
  product: Product;
}

interface SavedResponse {
  count: number;
  items: SavedItem[];
}

export default function SelectedPage() {
  const [saved, setSaved] = useState<SavedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [addingToCartIds, setAddingToCartIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    // TG BackButton
    if (isTelegramMiniApp()) {
      const webApp = getTelegramWebApp();
      if (webApp?.BackButton) {
        webApp.BackButton.show();
        webApp.BackButton.onClick(() => {
          router.push('/');
        });
      }
    }

    const t = localStorage.getItem("accessToken");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    fetchSaved(t);

    return () => {
      if (isTelegramMiniApp()) {
        const webApp = getTelegramWebApp();
        webApp?.BackButton?.hide();
      }
    };
  }, [router]);

  const fetchSaved = async (t: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/saved`, {
        headers: { Authorization: "Bearer " + t }
      });
      setSaved(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeSaved = async (productId: string) => {
    if (!token) return;
    
    setRemovingIds(prev => new Set(prev).add(productId));
    try {
      await axios.delete(`${API_BASE_URL}/saved/${productId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      // Remove from local state
      setSaved(prev => {
        if (!prev) return prev;
        return {
          count: prev.count - 1,
          items: prev.items.filter(item => item.product.productId !== productId)
        };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const addToCart = async (productId: string) => {
    if (!token) return;
    
    setAddingToCartIds(prev => new Set(prev).add(productId));
    try {
      await axios.post(`${API_BASE_URL}/cart/add`, { productId }, {
        headers: { Authorization: "Bearer " + token }
      });
      // Optional: show success message or navigate to cart
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCartIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const getImageUrl = (photos: string[]) => {
    if (photos && photos.length > 0) {
      const photo = photos[0];
      if (photo.startsWith('http')) return photo;
      return `${API_BASE_URL}/${photo}`;
    }
    return '/placeholder.png';
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Heart size={20} className="text-red-500 fill-red-500" />
              Saqlanganlar
              {saved && saved.count > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {saved.count}
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        {!saved || saved.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Heart size={40} className="text-red-200" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Saqlangan mahsulotlar yo'q
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Yoqtirgan mahsulotlaringizni yurakcha tugmasi orqali saqlang
            </p>
            <Link 
              href="/" 
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Xarid qilish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {saved.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/${item.product.productId}`}>
                  <div className="relative aspect-square bg-gray-50">
                    <img 
                      src={getImageUrl(item.product.photos)} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-600 px-2 py-1 rounded-lg">
                      {item.product.category}
                    </span>
                  </div>
                </Link>
                
                <div className="p-3">
                  <Link href={`/${item.product.productId}`}>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 hover:text-green-600 transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-green-600 font-bold text-lg mb-3">
                    {formatPrice(item.product.price)} so'm
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToCart(item.product.productId)}
                      disabled={addingToCartIds.has(item.product.productId)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {addingToCartIds.has(item.product.productId) ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          Savatga
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => removeSaved(item.product.productId)}
                      disabled={removingIds.has(item.product.productId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      title="O'chirish"
                    >
                      {removingIds.has(item.product.productId) ? (
                        <div className="w-5 h-5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
