"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface OrderProductItem {
  productId: string;
  name: string;
  price: number;
  count: number;
  photoUrl?: string;
}

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
  courierUserId?: number;
  productItems: OrderProductItem[];
}

interface Staff {
  id: number;
  fullName: string;
  role: string;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/order/admin`);
      setOrders(ordersRes.data);

      const staffRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/admin/staff`);
      const courierList = staffRes.data.filter((s: Staff) => s.role === "COURIER");
      setCouriers(courierList);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (status: string) => {
    const sMap: Record<string, { label: string, color: string }> = {
      NEW: { label: "Yangi", color: "bg-blue-100 text-blue-800" },
      ACCEPTED: { label: "Qabul qilingan", color: "bg-indigo-100 text-indigo-800" },
      ON_THE_WAY: { label: "Yo'lda", color: "bg-yellow-100 text-yellow-800" },  
      DELIVERED: { label: "Yetkazilgan", color: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Bekor qilingan", color: "bg-red-100 text-red-800" }  
    };
    return sMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const handleUpdateStatus = async (orderId: string, status: string, courierId?: number) => {
    try {
      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/order/admin/${orderId}`, {       
        orderStatus: status,
        courierUserId: courierId
      });

      // Refresh
      fetchData();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Xatolik yuz berdi");
    }
  };

  if (loading) return <div className="p-6">Yuklanmoqda...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Buyurtmalar ro'yxati</h1>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 text-black text-sm">ID</th>
              <th className="p-4 text-black text-sm">Mijoz / Tel</th>
              <th className="p-4 text-black text-sm">Tarkib</th>
              <th className="p-4 text-black text-sm">Summa (To'lov)</th>        
              <th className="p-4 text-black text-sm">Status</th>
              <th className="p-4 text-black text-sm">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">Buyurtmalar topilmadi</td></tr>
            )}
            {orders.map((order) => {
               const st = mapStatus(order.orderStatus);
               return (
                <tr key={order.id} className="border-b hover:bg-gray-50">       
                  <td className="p-4 text-gray-800">#{order.id}</td>
                  <td className="p-4 text-gray-800">
                    <div className="font-semibold">{order.fullName}</div>       
                    <div className="text-xs text-gray-500">{order.contactNumber}</div>
                  </td>
                  <td className="p-4">
                     <button 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-100 shadow-sm border border-blue-200"
                     >
                       Tarkibni ko'rish ({order.productItems?.length || 0} ta)
                     </button>
                  </td>
                  <td className="p-4 text-gray-800">
                    <div className="font-semibold text-green-600">{(order.summ + order.deliverySumm).toLocaleString()} so'm</div>
                    <div className="text-xs text-blue-600 font-bold">{order.paymentType}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${st.color}`}>
                      {st.label}
                    </span>
                    {order.grade && (
                       <div className="mt-1 text-xs text-orange-500 font-bold">{order.grade} ⭐️ Baho</div>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    {order.orderStatus === 'NEW' && (
                      <div className="flex flex-col gap-2 w-48">
                        <select
                          className="border p-1 rounded text-gray-800 text-xs"  
                          id={`courier-${order.id}`}
                          defaultValue=""
                        >
                          <option value="" disabled>Kuryer tanlang</option>     
                          {couriers.map(c => (
                            <option key={c.id} value={c.id}>{c.fullName}</option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                           <button
                              onClick={() => {
                                const selectEl = document.getElementById(`courier-${order.id}`) as HTMLSelectElement;
                                if (!selectEl.value) return alert("Avval kuryer tanlang");
                                handleUpdateStatus(order.orderId, "ACCEPTED", Number(selectEl.value));
                              }}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 w-full"
                            >
                              Qabul qilish
                           </button>
                           <button
                              onClick={() => handleUpdateStatus(order.orderId, "CANCELLED")}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 w-full"
                            >
                              Bekor qilish
                           </button>
                        </div>
                      </div>
                    )}

                    {order.orderStatus !== 'NEW' && (
                        <div className="text-gray-500 text-xs">
                          {order.courierUserId ? (
                             <span>Kuryer ID: {order.courierUserId}</span>      
                          ) : (
                             <span>Harakat yakunlangan</span>
                          )}
                        </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal - Tarkibni ko'rish */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                 <h2 className="text-lg font-bold text-gray-800">Buyurtma #{selectedOrder.id} - Tarkibi</h2>
                 <button 
                   onClick={() => setSelectedOrder(null)}
                   className="text-gray-500 hover:text-red-500 font-bold text-xl"
                 >
                   &times;
                 </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                 <div className="mb-4 text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded border">
                    <p><strong>Mijoz:</strong> {selectedOrder.fullName}</p>
                    <p><strong>Tel:</strong> {selectedOrder.contactNumber}</p>
                    <p><strong>Manzil:</strong> {selectedOrder.address}</p>
                 </div>

                 <div className="space-y-3">
                   {selectedOrder.productItems?.map((item, idx) => {
                     // Rasm manzili bazada /ProductPhoto/ bilan boshlansa yoki yo'q, to'g'rilab olamiz
                     const imgUrl = item.photoUrl?.startsWith('/') ? item.photoUrl : `/ProductPhoto/${item.photoUrl}`;
                     return (
                     <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded border shadow-sm">
                        {item.photoUrl ? (
                           <Image 
                             src={`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}${imgUrl}`} 
                             alt={item.name} 
                             width={60} 
                             height={60} 
                             className="rounded object-cover"
                           />
                        ) : (
                           <div className="w-[60px] h-[60px] bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                             Rasm yo'q
                           </div>
                        )}
                        <div className="flex-1">
                           <h3 className="font-semibold text-gray-800">{item.name}</h3>
                           <p className="text-gray-500 text-sm">Narxi: {item.price.toLocaleString()} so'm</p>
                        </div>
                        <div className="text-right">
                           <div className="font-bold text-gray-800">{item.count} ta</div>
                           <div className="text-green-600 font-semibold text-sm">
                              {(item.price * item.count).toLocaleString()} so'm
                           </div>
                        </div>
                     </div>
                     );
                   })}
                 </div>
              </div>

              <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                 <div>
                    <div className="text-sm text-gray-600">Yetkazib berish xizmati: {selectedOrder.deliverySumm.toLocaleString()} so'm</div>
                    <div className="text-lg font-bold text-gray-900 mt-1">Jami to'lanadigan: {(selectedOrder.summ + selectedOrder.deliverySumm).toLocaleString()} so'm</div>
                 </div>
                 <button 
                   onClick={() => setSelectedOrder(null)}
                   className="bg-gray-800 text-white px-6 py-2 rounded shadow hover:bg-gray-900"
                 >
                   Yopish
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}