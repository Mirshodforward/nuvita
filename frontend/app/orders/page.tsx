"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  MapPin,
  CreditCard,
  Star,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: number;
  orderId: string;
  fullName: string;
  contactNumber: string;
  address: string;
  summ: number;
  deliverySumm: number;
  paymentType: string;
  orderStatus: "NEW" | "ACCEPTED" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  grade?: number;
  productItems: any[];
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
       fetchOrders(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async (showLoading = true) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      
      const res = await axios.get(`${API_BASE_URL}/order/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      }
      console.error(err);
    } finally {
      if(showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { label: string, color: string, bgColor: string, borderColor: string, icon: any, step: number }> = {
      NEW: { 
        label: "Tasdiqlash kutilmoqda", 
        color: "text-blue-700", 
        bgColor: "bg-blue-50", 
        borderColor: "border-blue-200",
        icon: Clock,
        step: 1 
      },
      ACCEPTED: { 
        label: "Buyurtma yig'ilmoqda", 
        color: "text-indigo-700", 
        bgColor: "bg-indigo-50", 
        borderColor: "border-indigo-200",
        icon: Package,
        step: 2 
      },
      ON_THE_WAY: { 
        label: "Buyurtma yo'lda", 
        color: "text-amber-700", 
        bgColor: "bg-amber-50", 
        borderColor: "border-amber-200",
        icon: Truck,
        step: 3 
      },
      DELIVERED: { 
        label: "Yetkazib berildi", 
        color: "text-green-700", 
        bgColor: "bg-green-50", 
        borderColor: "border-green-200",
        icon: CheckCircle2,
        step: 4 
      },
      CANCELLED: { 
        label: "Bekor qilingan", 
        color: "text-red-700", 
        bgColor: "bg-red-50", 
        borderColor: "border-red-200",
        icon: XCircle,
        step: 0 
      }
    };
    return statusMap[status] || { label: status, color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200", icon: Package, step: 0 };
  };

  const getPaymentLabel = (type: string) => {
    const types: Record<string, string> = {
      'CASH': "Naqd pul",
      'CARD': "Plastik karta",
      'CLICK': "Click",
      'PAYME': "Payme"
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/"
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mening buyurtmalarim</h1>
                <p className="text-sm text-gray-500">{orders.length} ta buyurtma</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={`text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Yuklanmoqda...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={36} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Buyurtmalar yo'q</h3>
            <p className="text-gray-500 mb-6">Hozircha siz hech qanday buyurtma bermagansiz</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Xarid qilish
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = getStatusConfig(order.orderStatus);
              const StatusIcon = status.icon;
              
              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-4 sm:p-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">Buyurtma #{order.id}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('uz-UZ', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgColor} ${status.borderColor} border`}>
                        <StatusIcon size={16} className={status.color} />
                        <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                      </div>
                    </div>

                    {/* Progress Steps (only for non-cancelled orders) */}
                    {order.orderStatus !== 'CANCELLED' && (
                      <div className="mt-4 flex items-center gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div 
                            key={step}
                            className={`flex-1 h-1.5 rounded-full transition-colors ${
                              step <= status.step 
                                ? 'bg-green-500' 
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div className="p-4 sm:p-5 bg-gray-50/50">
                    <div className="space-y-2">
                      {order.productItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 text-sm">{item.name}</span>
                            <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">×{item.count}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {(item.price * item.count).toLocaleString()} so'm
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-4 sm:p-5 border-t border-gray-100">
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <MapPin size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Yetkazish manzili</div>
                          <div className="text-sm font-medium text-gray-900">{order.address}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CreditCard size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">To'lov usuli</div>
                          <div className="text-sm font-medium text-gray-900">
                            {getPaymentLabel(order.paymentType)}
                            {order.paymentType === 'CASH' && order.orderStatus === 'DELIVERED' && (
                              <span className="text-green-600 ml-1">(To'langan)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-sm text-gray-500">Yetkazish: </span>
                        <span className="text-sm font-medium text-gray-700">{order.deliverySumm.toLocaleString()} so'm</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Jami summa</div>
                        <div className="text-xl font-bold text-gray-900">
                          {(order.summ + order.deliverySumm).toLocaleString()} so'm
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating (if exists) */}
                  {order.grade && (
                    <div className="px-4 sm:px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
                      <Star size={16} className="text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium text-amber-700">
                        Sizning bahoingiz: {order.grade}/5
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}