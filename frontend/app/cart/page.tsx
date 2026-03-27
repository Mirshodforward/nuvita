
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";

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
    const t = localStorage.getItem("accessToken");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    fetchCart(t);
  }, []);

  const fetchCart = async (t: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart`, {
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
      const res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart/item/` + id, { action }, {
        headers: { Authorization: "Bearer " + token }
      });
      setCart(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id: number) => {
    try {
      const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart/item/` + id, {
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
        const res = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart/clear`, {
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
      <div className="flex h-[70vh] items-center justify-center space-x-2 text-gray-500">
        <div className="w-5 h-5 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        <span className="font-medium text-lg">Savat yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl items-center flex gap-3 font-semibold text-gray-900 tracking-tight">
             <ShoppingBag size={28} className="text-green-600" /> Savat
          </h1>
          {cart && cart.items.length > 0 && (
            <button onClick={clearCart} className="text-sm font-medium text-red-500 hover:text-red-600 transition underline underline-offset-2">
              Hammasini o`chirish
            </button>
          )}
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center max-w-lg mx-auto shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={36} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-medium text-gray-900 mb-2">Savatingiz bo`sh</h2>
            <p className="text-gray-500 mb-8">Hali hech qanday mahsulot qoshmadingiz.</p>
            <Link href="/" className="inline-flex items-center justify-center bg-black hover:bg-gray-800 text-white px-8 py-3.5 rounded-xl font-medium transition duration-200">
              Bosh sahifaga qaytish
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Products List */}
            <div className="flex-1">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <ul className="divide-y divide-gray-50">
                  {cart.items.map((item) => (
                    <li key={item.id} className="p-6 flex items-center gap-6 hover:bg-gray-50/50 transition">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                        {item.product.photoUrl ? (
                          <img src={`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}` + item.product.photoUrl} className="w-full h-full object-cover" alt={item.product.name} />
                        ) : (
                          <div className="w-full h-full flex justify-center items-center text-xs text-gray-400">Rasm yo`q</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link href={"/" + encodeURIComponent(item.product.name)} className="text-lg font-medium text-gray-900 hover:text-green-600 transition truncate block mb-1">
                          {item.product.name}
                        </Link>
                        <p className="text-sm font-medium text-gray-500">{item.product.price.toLocaleString()} so`m / dona</p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <button onClick={() => updateItem(item.id, "decrement")} className="p-2.5 text-gray-600 hover:bg-gray-50 transition active:bg-gray-100">
                            <Minus size={16} strokeWidth={2.5} />
                          </button>
                          <span className="w-10 text-center font-semibold text-gray-800 tabular-nums">{item.productCount}</span>
                          <button onClick={() => updateItem(item.id, "increment")} className="p-2.5 text-green-600 hover:bg-green-50 transition active:bg-green-100">
                            <Plus size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                        
                        <div className="hidden sm:block w-32 text-right">
                          <div className="text-lg font-semibold text-gray-900 tabular-nums">
                            {(item.product.price * item.productCount).toLocaleString()}
                          </div>
                        </div>

                        <button onClick={() => removeItem(item.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition" title="O`chirish">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Maxsus chegirma</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Mahsulotlar soni</span>
                    <span className="font-medium text-gray-900">{cart.count} dona</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Oraliq summa</span>
                    <span className="font-medium text-gray-900">{cart.summ.toLocaleString()} so`m</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 mb-8">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-base font-medium text-gray-900">Jami to`lov</span>
                    <span className="text-2xl font-bold tracking-tight text-gray-900">{cart.summ.toLocaleString()} so`m</span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">Yetkazib berish xizmati keyingi bosqichda hisoblanadi</p>
                </div>

                <div className="space-y-3">
                  <button onClick={proceedToCheckout} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-semibold text-lg transition duration-200">
                    Rasmiylashtirish <ArrowRight size={20} />
                  </button>
                  <Link href="/" className="w-full flex items-center justify-center py-4 text-gray-600 hover:text-gray-900 font-medium transition duration-200">
                    Boshqa mahsulot izlash
                  </Link>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

