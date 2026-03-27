"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

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

  useEffect(() => {
    fetchOrders();
    // Optional: Set up an interval for live polling every 10 seconds
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
      
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/order/me`, {
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
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string, color: string, step: number }> = {
      NEW: { label: "Tasdiqlash kutilmoqda...", color: "text-blue-600", step: 1 },
      ACCEPTED: { label: "Buyurtma yig'ilmoqda 📦", color: "text-indigo-600", step: 2 },
      ON_THE_WAY: { label: "Buyurtma yo'lda 🛵", color: "text-yellow-600", step: 3 },
      DELIVERED: { label: "Yetkazib berildi ✅", color: "text-green-600", step: 4 },
      CANCELLED: { label: "Bekor qilingan ❌", color: "text-red-600", step: 0 }
    };
    return statusMap[status] || { label: status, color: "text-gray-600", step: 0 };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          Mening Buyurtmalarim
        </h1>

        {loading ? (
           <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>
        ) : orders.length === 0 ? (
           <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow">
              Hozircha buyurtmalaringiz yo'q
           </div>
        ) : (
          <div className="space-y-6">
             {orders.map(order => {
                const display = getStatusDisplay(order.orderStatus);
                return (
                  <div key={order.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                     <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b">
                        <div>
                           <div className="text-sm text-gray-500">Buyurtma #{order.id}</div>
                           <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('uz-UZ')}</div>
                        </div>
                        <div className={`font-semibold mt-2 md:mt-0 ${display.color}`}>
                           {display.label}
                        </div>
                     </div>

                     <div className="mb-4">
                        {order.productItems.map((item: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center text-sm py-1">
                               <div className="text-gray-700">{item.name} x {item.count}</div>
                               <div className="text-gray-900 font-medium">{(item.price * item.count).toLocaleString()} so'm</div>
                           </div>
                        ))}
                     </div>

                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-3 rounded text-sm">
                         <div className="text-gray-600">
                             <strong>Manzil:</strong> {order.address} <br/>
                             <strong>To'lov:</strong> {order.paymentType} {order.paymentType === 'CASH' && order.orderStatus === 'DELIVERED' ? "(To'langan)" : ""}
                         </div>
                         <div className="mt-2 md:mt-0 text-right">
                             <div className="text-gray-500 text-xs">Yetkazish: {order.deliverySumm.toLocaleString()} so'm</div>
                             <div className="text-lg font-bold text-gray-900">
                                Jami: {(order.summ + order.deliverySumm).toLocaleString()} so'm
                             </div>
                         </div>
                     </div>

                     {order.grade && (
                         <div className="mt-4 pt-3 border-t text-sm font-semibold text-orange-500">
                            Sizning bahoingiz: {order.grade} / 5 ⭐️
                         </div>
                     )}
                  </div>
                );
             })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}