"use client";

import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  ChevronRight, 
  Grid3X3,
  List,
  Search,
  X,
  ArrowLeft
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

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

// Product Card Component
function ProductCard({ 
  product, 
  cartItem, 
  onAddToCart, 
  onUpdateCount 
}: { 
  product: Product; 
  cartItem?: CartItem; 
  onAddToCart: (productId: string) => void;
  onUpdateCount: (cartItemId: number, action: "increment" | "decrement") => void;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full">
      <Link href={`/${encodeURIComponent(product.name)}`} className="relative h-40 sm:h-48 overflow-hidden bg-gray-50 block">
        {product.photoUrl ? (
          <img 
            src={`${API_BASE_URL}` + product.photoUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Rasm yo'q</div>
        )}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full font-bold text-green-700 text-xs sm:text-sm shadow-sm">
          {product.price?.toLocaleString()} so'm
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <Link href={`/${encodeURIComponent(product.name)}`}>
          <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 line-clamp-2 hover:text-green-600 transition-colors">{product.name}</h4>
        </Link>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1 hidden sm:block">{product.ingredients}</p>

        <div className="mt-auto">
          {cartItem ? (
            <div className="bg-green-50 border border-green-200 rounded-xl flex items-center justify-between px-1.5 py-1 h-10">
              <button
                onClick={() => onUpdateCount(cartItem.id, "decrement")}
                className="bg-white p-1.5 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-sm px-2">{cartItem.productCount}</span>
              <button
                onClick={() => onUpdateCount(cartItem.id, "increment")}
                className="bg-green-600 p-1.5 rounded-lg text-white hover:bg-green-700 transition"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product.productId)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Savatga</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CatalogContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedCategoryId = searchParams.get("category");

  const fetchCartOptions = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/cart`, {
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
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/admin/product`),
          axios.get(`${API_BASE_URL}/admin/category`)
        ]);
        const activeProducts = prodRes.data.filter((p: any) => p.active !== false);
        const activeCategories = catRes.data.filter((c: any) => c.isActive !== false);
        setProducts(activeProducts);
        setCategories(activeCategories);
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
        `${API_BASE_URL}/cart/add`,
        { productId, productCount: 1 },
        { headers: { Authorization: "Bearer " + token } }
      );
      fetchCartOptions();
    } catch (err: any) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        alert("Sessiya vaqti tugagan. Iltimos qayta tizimga kiring.");
        window.location.href = "/login";
      } else {
        alert("Xatolik yuz berdi.");
      }
    }
  };

  const updateItemCount = async (cartItemId: number, action: "increment" | "decrement") => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    try {
      await axios.patch(`${API_BASE_URL}/cart/item/` + cartItemId, { action }, {
        headers: { Authorization: "Bearer " + token }
      });
      fetchCartOptions();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter products based on category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryId ? p.categoryId === parseInt(selectedCategoryId) : true;
    const matchesSearch = searchQuery 
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) 
      : true;
    return matchesCategory && matchesSearch;
  });

  const selectedCategory = categories.find(c => c.id === parseInt(selectedCategoryId || "0"));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Categories */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-36">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Grid3X3 size={18} className="text-green-600" />
                Kataloglar
              </h3>
              <nav className="space-y-1">
                <button
                  onClick={() => router.push("/catalog")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-colors ${
                    !selectedCategoryId 
                      ? "bg-green-50 text-green-700" 
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Barcha mahsulotlar
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => router.push(`/catalog?category=${category.id}`)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-between ${
                      selectedCategoryId === category.id.toString() 
                        ? "bg-green-50 text-green-700" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-gray-400">
                      {products.filter(p => p.categoryId === category.id).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Categories */}
            <div className="lg:hidden mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => router.push("/catalog")}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    !selectedCategoryId 
                      ? "bg-green-600 text-white" 
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  Hammasi
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => router.push(`/catalog?category=${category.id}`)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                      selectedCategoryId === category.id.toString() 
                        ? "bg-green-600 text-white" 
                        : "bg-white text-gray-700 border border-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Mahsulot topilmadi</h3>
                <p className="text-gray-500 text-sm">
                  {searchQuery 
                    ? `"${searchQuery}" so'rovi bo'yicha hech narsa topilmadi`
                    : "Bu katalogda hozircha mahsulotlar yo'q"
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map(product => {
                  const cartItem = cartItems.find(item => item.productId === product.productId);
                  return (
                    <ProductCard 
                      key={product.id}
                      product={product} 
                      cartItem={cartItem} 
                      onAddToCart={addToCart}
                      onUpdateCount={updateItemCount}
                    />
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
