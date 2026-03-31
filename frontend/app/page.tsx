
"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  ArrowRight, 
  Phone,
  ChevronRight,
  ChevronLeft,
  Grid3X3
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ContactPage from "@/app/contact/page";

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
  photos: string[];
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
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col h-full min-w-[160px] sm:min-w-[200px]">
      <Link href={`/${encodeURIComponent(product.name)}`} className="block">
        <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-50">
          {product.photos && product.photos.length > 0 ? (
            <img 
              src={`${API_BASE_URL}` + product.photos[0]} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Rasm yo'q</div>
          )}
          <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full font-bold text-green-700 text-xs sm:text-sm shadow-sm">
            {product.price?.toLocaleString()} so'm
          </div>
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <Link href={`/${encodeURIComponent(product.name)}`}>
          <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 line-clamp-2 hover:text-green-600 transition-colors cursor-pointer">{product.name}</h4>
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

// Category Row Component with horizontal scroll
function CategoryRow({ 
  category, 
  products, 
  cartItems, 
  onAddToCart, 
  onUpdateCount 
}: { 
  category: Category; 
  products: Product[]; 
  cartItems: CartItem[];
  onAddToCart: (productId: string) => void;
  onUpdateCount: (cartItemId: number, action: "increment" | "decrement") => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-green-500 rounded-full"></div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{category.name}</h3>
          <span className="text-sm text-gray-400 font-medium">({products.length})</span>
        </div>
        <Link 
          href={`/catalog?category=${category.id}`}
          className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-semibold text-sm transition-colors group"
        >
          Hammasi
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Products Row */}
      <div className="relative group/container">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover/container:opacity-100 transition-opacity -ml-3"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
        )}

        {/* Products Container */}
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(product => {
            const cartItem = cartItems.find(item => item.productId === product.productId);
            return (
              <div key={product.id} className="flex-shrink-0 w-[160px] sm:w-[200px]">
                <ProductCard 
                  product={product} 
                  cartItem={cartItem} 
                  onAddToCart={onAddToCart}
                  onUpdateCount={onUpdateCount}
                />
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover/container:opacity-100 transition-opacity -mr-3"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
}

function ProductList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

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
      await axios.patch(`${API_BASE_URL}/cart/item/` + cartItemId, { action }, {
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
    <div className="bg-gray-50 pb-32 min-h-screen font-sans">
      {/* Hero Section */}
      {!searchQuery && (
        <section className="bg-white border-b border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-green-50/50 to-transparent pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
           
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
                Sog'lig'ingiz uchun <br className="hidden md:block" /> 
                <span className="text-green-600">tabiiy</span> yechimlar
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                Nuvita - oilangiz uchun eng sifatli, xavfsiz va ishonchli vositalar platformasi. 
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  Mahsulotlarni ko'rish
                  <ChevronRight size={20} />
                </button>
                <Link 
                  href="/contact"
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Phone size={20} className="text-gray-500" />
                  Bog'lanish
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="products-section">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="border-l-4 border-green-500 pl-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {searchQuery ? `"${searchQuery}" bo'yicha natijalar` : "Bizning mahsulotlar"}
            </h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Sifatli va sertifikatlangan mahsulotlar</p>
          </div>
          <Link 
            href="/catalog"
            className="hidden sm:flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            <Grid3X3 size={18} />
            Katalog
          </Link>
        </div>

        {/* Search Results */}
        {searchQuery ? (
          <div>
            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 italic bg-white p-6 rounded-xl shadow-sm border text-center">
                Hech qanday mahsulot topilmadi.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
          </div>
        ) : (
          /* Category-based Product Rows */
          <div>
            {categories.length === 0 && products.length === 0 ? (
              <p className="text-gray-500 italic bg-white p-6 rounded-xl shadow-sm border text-center">
                Hozircha faol mahsulotlar mavjud emas.
              </p>
            ) : (
              <>
                {categories.map(category => {
                  const categoryProducts = products.filter(p => p.categoryId === category.id);
                  return (
                    <CategoryRow 
                      key={category.id}
                      category={category}
                      products={categoryProducts}
                      cartItems={cartItems}
                      onAddToCart={addToCart}
                      onUpdateCount={updateItemCount}
                    />
                  );
                })}
                
                {/* Products without category */}
                {products.filter(p => !categories.some(c => c.id === p.categoryId)).length > 0 && (
                  <CategoryRow 
                    category={{ id: 0, name: "Boshqa mahsulotlar", description: "", isActive: true }}
                    products={products.filter(p => !categories.some(c => c.id === p.categoryId))}
                    cartItems={cartItems}
                    onAddToCart={addToCart}
                    onUpdateCount={updateItemCount}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function IntroScreen({ onComplete }: { onComplete: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Kichik kechikish bilan yozuvlar chiqishini boshlash
    const mountTimer = setTimeout(() => setMounted(true), 150);
    const outTimer = setTimeout(() => setIsAnimatingOut(true), 2400); // x soniyadan keyin tepaga suriladi
    const completeTimer = setTimeout(() => onComplete(), 3200); // to'liq tugash vaqti
    
    // Tizim orqasi skroll bo'lib ketmasligi uchun
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(mountTimer);
      clearTimeout(outTimer);
      clearTimeout(completeTimer);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  const word = "Nuvitauz".split("");

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isAnimatingOut ? '-translate-y-full rounded-b-[40%]' : 'translate-y-0'
      }`}
    >
      <div className="flex overflow-hidden p-2">
        {word.map((char, i) => (
          <span
            key={i}
            className="text-6xl md:text-8xl lg:text-9xl font-black text-green-600 transform transition-transform duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{ 
              transform: mounted ? 'translateY(0)' : 'translateY(110%)',
              transitionDelay: mounted ? `${i * 80}ms` : '0ms'
            }}
          >
            {char}
          </span>
        ))}
      </div>
      
      {/* Zamonaviy 'loading' chizig'i */}
      <div 
        className="mt-8 h-1 bg-gray-100 rounded-full overflow-hidden w-64 md:w-80 relative transition-opacity duration-700 delay-500"
        style={{ opacity: mounted ? 1 : 0 }}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-[2000ms] ease-out"
          style={{ width: mounted ? '100%' : '0%' }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Faqat birinchi marta kirganda ko'rsatish uchun (sessionStorage)
    const hasSeenSplash = sessionStorage.getItem('nuvitauz_splash_seen');
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem('nuvitauz_splash_seen', 'true');
    }
  }, []);

  return (
    <>
      {showSplash && <IntroScreen onComplete={() => setShowSplash(false)} />}
      <div className={showSplash ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'}>
        <Suspense fallback={<div className="text-center py-20">Yuklanmoqda...</div>}>
          <ProductList />
        </Suspense>
        <section id="contact">
          <ContactPage />
        </section>
      </div>
    </>
  );
}

