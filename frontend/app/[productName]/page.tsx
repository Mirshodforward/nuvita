"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Info, List, CheckCircle2 } from "lucide-react";

interface Product {
  id: number;
  productId: string;
  name: string;
  ingredients: string;
  uses: string;
  description: string;
  photoUrl: string;
  price: number;
  categoryId: number;
  active: boolean;
}

export default function ProductDetailsPage() {
  const { productName } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const decodedName = decodeURIComponent(productName as string);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/admin/product`);
        const found = res.data.find((p: Product) => p.name === decodedName && p.active !== false);
        setProduct(found || null);
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };

    if (productName) {
      fetchProduct();
    }
  }, [productName]);

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Iltimos, avval tizimga kiring!");
      router.push("/login");
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart/add`,
        { productId, productCount: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // alert("Mahsulot savatga qo'shildi!");
    } catch (err: any) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        alert("Sessiya vaqti tugagan yoki xatolik. Iltimos qayta tizimga kiring.");
        router.push("/login");
      } else {
        alert("Xatolik yuz berdi yoki avtorizatsiyadan o'tmagansiz.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mahsulot topilmadi</h2>
        <button 
          onClick={() => router.push('/')}
          className="text-green-600 font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} /> Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-green-600 font-medium mb-8 transition-colors w-fit bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
        >
          <ArrowLeft size={20} /> Orqaga qaytish
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Image Section */}
            <div className="lg:w-1/2 bg-gray-100 p-8 flex items-center justify-center relative min-h-[300px] lg:min-h-[500px]">
              {product.photoUrl ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}${product.photoUrl}`} 
                  alt={product.name} 
                  className="w-full max-w-md h-auto object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="text-gray-400 font-medium flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">?</div>
                  Rasm mavjud emas
                </div>
              )}
              
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full font-bold text-xl text-green-700 shadow-lg border border-green-50">
                {product.price?.toLocaleString()} so'm
              </div>
            </div>

            {/* Content Section */}
            <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                {product.name}
              </h1>

              <div className="space-y-8 flex-1">
                {product.description && (
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 border-b pb-2">
                      <List size={20} className="text-blue-500" /> Tavsifi
                    </h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}

                {product.ingredients && (
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 border-b pb-2">
                      <Info size={20} className="text-orange-500" /> Tarkibi
                    </h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {product.ingredients}
                    </p>
                  </div>
                )}

                {product.uses && (
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 border-b pb-2">
                      <CheckCircle2 size={20} className="text-green-500" /> Qanday foydalaniladi?
                    </h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {product.uses}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100">
                <button
                  onClick={() => addToCart(product.productId)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 transition duration-300 flex items-center justify-center gap-3 text-lg hover:-translate-y-1"
                >
                  <ShoppingCart size={24} />
                  Savatga qo'shish
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
