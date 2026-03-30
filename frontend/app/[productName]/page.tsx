"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Info, 
  List, 
  CheckCircle2, 
  Star,
  Send,
  User,
  MessageSquare,
  Loader2
} from "lucide-react";

interface ProductScore {
  id: number;
  productId: string;
  number: string;
  fullName: string;
  comment: string | null;
  grade: number;
  createdAt: string;
}

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
  scores?: ProductScore[];
  rating?: number;
  reviewCount?: number;
}

export default function ProductDetailsPage() {
  const { productName } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ProductScore[]>([]);
  const [rating, setRating] = useState({ average: 0, count: 0 });
  
  // Review form state
  const [reviewGrade, setReviewGrade] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const fetchProductAndReviews = async () => {
    try {
      const decodedName = decodeURIComponent(productName as string);
      const res = await axios.get(`${API_BASE_URL}/admin/product`);
      const found = res.data.find((p: Product) => p.name === decodedName && p.active !== false);
      
      if (found) {
        setProduct(found);
        
        // Fetch reviews and rating
        const [reviewsRes, ratingRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/score/product/${found.productId}`),
          axios.get(`${API_BASE_URL}/score/rating/${found.productId}`)
        ]);
        
        setReviews(reviewsRes.data);
        setRating(ratingRes.data);
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error("Error fetching product", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productName) {
      fetchProductAndReviews();
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
        `${API_BASE_URL}/cart/add`,
        { productId, productCount: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err: any) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        alert("Sessiya vaqti tugagan. Iltimos qayta tizimga kiring.");
        router.push("/login");
      } else {
        alert("Xatolik yuz berdi.");
      }
    }
  };

  const submitReview = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Izoh qoldirish uchun tizimga kiring!");
      router.push("/login");
      return;
    }

    if (!product) return;

    setSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/score`,
        {
          productId: product.productId,
          comment: reviewComment.trim() || null,
          grade: reviewGrade,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh reviews
      await fetchProductAndReviews();
      setReviewComment("");
      setReviewGrade(5);
    } catch (err: any) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        alert("Sessiya vaqti tugagan. Iltimos qayta tizimga kiring.");
        router.push("/login");
      } else {
        alert("Izoh yuborishda xatolik.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, size = 20, interactive = false }: { rating: number; size?: number; interactive?: boolean }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setReviewGrade(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              size={size}
              className={`${
                star <= (interactive ? (hoverRating || reviewGrade) : rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <div className="lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center relative min-h-[300px] lg:min-h-[500px]">
              {product.photoUrl ? (
                <img 
                  src={`${API_BASE_URL}${product.photoUrl}`} 
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
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Rating Display */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <StarRating rating={rating.average} size={24} />
                <span className="text-2xl font-bold text-gray-900">{rating.average.toFixed(1)}</span>
                <span className="text-gray-500">({rating.count} ta izoh)</span>
              </div>

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
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 transition duration-300 flex items-center justify-center gap-3 text-lg hover:-translate-y-1"
                >
                  <ShoppingCart size={24} />
                  Savatga qo'shish
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 space-y-8">
          
          {/* Write Review Form */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <MessageSquare className="text-green-500" size={28} />
              Izoh qoldirish
            </h2>

            {isLoggedIn ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Bahoingiz
                  </label>
                  <div className="flex items-center gap-4">
                    <StarRating rating={reviewGrade} size={32} interactive />
                    <span className="text-lg font-semibold text-gray-700">
                      {reviewGrade} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Izohingiz (ixtiyoriy)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Mahsulot haqida fikringizni yozing..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none transition-colors"
                  />
                </div>

                <button
                  onClick={submitReview}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Izoh yuborish
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-2xl">
                <User size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Izoh qoldirish uchun tizimga kiring</p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition-colors"
                >
                  Kirish
                </button>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Star className="text-yellow-400 fill-yellow-400" size={28} />
              Izohlar ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Hali izoh qoldirilmagan</p>
                <p className="text-sm text-gray-400 mt-2">Birinchi bo'lib izoh qoldiring!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div 
                    key={review.id}
                    className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {review.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900">{review.fullName}</span>
                          <StarRating rating={review.grade} size={16} />
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 leading-relaxed mb-2">
                            {review.comment}
                          </p>
                        )}
                        <p className="text-sm text-gray-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
