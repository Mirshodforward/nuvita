"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";
import { getTelegramWebApp, isTelegramMiniApp } from "@/lib/telegram";

interface Product {
  productId: string;
  name: string;
  photoUrl: string;
  price: number;
}

interface CartItem {
  id: number;
  productId: string;
  productCount: number;
  product: Product;
}

interface Cart {
  id: number;
  count: number;
  summ: number;
  items: CartItem[];
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
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
    fetchCart(t);

    return () => {
      if (isTelegramMiniApp()) {
        const webApp = getTelegramWebApp();
        webApp?.BackButton?.hide();
      }
    };
  }, [router]);

  const fetchCart = async (t: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { Authorization: "Bearer " + t }
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: number, action: "increment" | "decrement") => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/cart/item/` + id, { action }, {
        headers: { Authorization: "Bearer " + token }
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id: number) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/cart/item/` + id, {
        headers: { Authorization: "Bearer " + token }
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    if (confirm("Savatni tozalashni tasdiqlaysizmi?")) {
      try {
        const res = await axios.delete(`${API_BASE_URL}/cart/clear`, {
          headers: { Authorization: "Bearer " + token }
        });
        setCart(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const proceedToCheckout = () => {
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
          <span className="text-gray-500 text-sm">Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag size={20} className="text-green-600" />
              Savat
              {cart && cart.count > 0 && (
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.count}
                </span>
              )}
            </h1>
          </div>
          {cart && cart.items.length > 0 && (
            <button onClick={clearCart} className="text-xs font-medium text-red-500 hover:text-red-600">
              Tozalash
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4">
        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Savat bo&apos;sh</h2>
            <p className="text-sm text-gray-500 mb-6">Hali mahsulot qo&apos;shilmagan</p>
            <Link href="/" className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition">
              Xarid qilish
            </Link>
          </div>
        ) : (
          <>
            {/* Products List */}
            <div className="space-y-3 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.product.photoUrl ? (
                        <img 
                          src={`${API_BASE_URL}` + item.product.photoUrl} 
                          className="w-full h-full object-cover" 
                          alt={item.product.name} 
                        />
                      ) : (
                        <div className="w-full h-full flex justify-center items-center text-xs text-gray-400">
                          Rasm yo&apos;q
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <Link 
                        href={"/" + encodeURIComponent(item.product.name)} 
                        className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-gray-500 mb-2">
                        {item.product.price.toLocaleString()} so&apos;m / dona
                      </p>
                      
                      {/* Controls Row */}
                      <div className="flex items-center justify-between mt-auto">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                          <button 
                            onClick={() => updateItem(item.id, "decrement")} 
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition"
                          >
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900">
                            {item.productCount}
                          </span>
                          <button 
                            onClick={() => updateItem(item.id, "increment")} 
                            className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 active:bg-green-100 transition"
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {(item.product.price * item.productCount).toLocaleString()} so&apos;m
                          </span>
                          <button 
                            onClick={() => removeItem(item.id)} 
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add More */}
            <Link 
              href="/" 
              className="block text-center text-sm text-green-600 font-medium py-3 hover:text-green-700"
            >
              + Yana mahsulot qo&apos;shish
            </Link>
          </>
        )}
      </div>

      {/* Fixed Bottom Summary */}
      {cart && cart.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-20">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500">Jami ({cart.count} ta mahsulot)</p>
                <p className="text-xl font-bold text-gray-900">{cart.summ.toLocaleString()} so&apos;m</p>
              </div>
              <button 
                onClick={proceedToCheckout} 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold text-sm transition"
              >
                Buyurtma berish
                <ArrowRight size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Yetkazib berish narxi keyingi sahifada hisoblanadi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

