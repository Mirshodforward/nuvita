
"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface Product {
  id: number;
  productId: string;
  name: string;
  ingredients: string;
  usage: string;
  photoUrl: string;
  price: number;
  categoryId: number;
  active: boolean;
}

interface CartItem {
  id: number;
  productId: string;
  productCount: number;
}

function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const fetchCartOptions = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (res.data && res.data.items) {
        setCartItems(res.data.items);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Cart error", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/admin/product`);
        const activeProducts = prodRes.data.filter((p: any) => p.active !== false);
        setProducts(activeProducts);
      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchCartOptions();
  }, []);

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Iltimos, avval tizimga kiring!");
      window.location.href = "/login";
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart/add`,
        { productId, productCount: 1 },
        { headers: { Authorization: "Bearer " + token } }
      );
      fetchCartOptions();
    } catch (err: any) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        alert("Sessiya vaqti tugagan yoki xatolik. Iltimos qayta tizimga kiring.");
        window.location.href = "/login";
      } else {
        alert("Xatolik yuz berdi yoki avtorizatsiyadan o`tmagansiz.");
      }
    }
  };

  const updateItemCount = async (cartItemId: number, action: "increment" | "decrement") => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart/item/` + cartItemId, { action }, {
        headers: { Authorization: "Bearer " + token }
      });
      fetchCartOptions();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 text-gray-500 font-medium text-lg">Yuklanmoqda...</div>;

  return (
    <div className="bg-gray-50 pb-32 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        <section>
          <div className="flex justify-between items-end mb-8 border-l-4 border-green-500 pl-4">
            <h3 className="text-3xl font-extrabold text-gray-800">
              {searchQuery ? `"${searchQuery}" bo'yicha natijalar` : "Barcha Mahsulotlar"}
            </h3>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-gray-500 italic bg-white p-6 rounded-xl shadow-sm border text-center">
              {searchQuery ? "Hech qanday mahsulot topilmadi." : "Hozircha faol mahsulotlar mavjud emas."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map(p => { 
                const cartItem = cartItems.find((item) => item.productId === p.productId); 
                return (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group flex flex-col h-full">
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    {p.photoUrl ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}` + p.photoUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">Rasm yo'q</div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full font-bold text-green-700 shadow-sm">
                      {p.price?.toLocaleString()} so'm
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-xl font-extrabold text-gray-900 mb-3 line-clamp-2">{p.name}</h4>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">{p.ingredients}</p>

                    <div className="mt-auto flex flex-col sm:flex-row gap-2">
                        {cartItem ? (
                          <div className="w-full sm:w-1/2 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between px-2 py-1.5 h-[52px]">
                            <button
                              onClick={() => updateItemCount(cartItem.id, "decrement")}
                              className="bg-white p-2 rounded-lg text-gray-700 hover:bg-gray-50 flex-1 flex justify-center shadow-sm transition"
                            >
                              <Minus size={20} />
                            </button>
                            <span className="font-bold text-lg px-2 flex-1 text-center">{cartItem.productCount}</span>
                            <button
                              onClick={() => updateItemCount(cartItem.id, "increment")}
                              className="bg-green-600 p-2 rounded-lg text-white hover:bg-green-700 flex-1 flex justify-center shadow-sm transition"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(p.productId)}
                            className="w-full sm:w-1/2 bg-green-50 hover:bg-green-600 text-green-700 hover:text-white border border-green-200 hover:border-green-600 font-bold py-3.5 rounded-xl transition duration-300 flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={20} />
                            Savatga
                          </button>
                        )}
                        <button
                          onClick={() => { window.location.href = "/" + encodeURIComponent(p.name); }}
                          className="w-full sm:w-1/2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 font-bold py-3.5 rounded-xl transition duration-300 flex items-center justify-center gap-2"
                        >
                          Batafsil
                        </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-20">Yuklanmoqda...</div>}>
      <ProductList />
    </Suspense>
  )
}

