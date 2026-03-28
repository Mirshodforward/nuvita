"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  UserCircle, 
  Settings, 
  ShoppingBag, 
  LogOut, 
  ChevronRight, 
  Package, 
  MapPin, 
  Calendar, 
  Phone,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Edit2,
  Save,
  X,
  Globe,
  ArrowLeft
} from "lucide-react";
import { getTelegramUser, isTelegramMiniApp } from "@/lib/telegram";

interface UserProfile {
  id: number;
  number: string;
  userId: string | null;
  username: string | null;
  fullName: string | null;
  email: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  lang: string;
  profileComplete: boolean;
}

interface Order {
  id: number;
  orderId: string;
  summ: number;
  deliverySumm: number;
  paymentType: string;
  orderStatus: "NEW" | "ACCEPTED" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";
  createdAt: string;
  address: string;
  productItems: any[];
}

type TabType = 'info' | 'orders' | 'settings';

export default function ProfilePage() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tgPhotoUrl, setTgPhotoUrl] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<TabType>('info');
  
  // Edit logic
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  const router = useRouter();

  useEffect(() => {
    // Get TG photo and user data if in mini app
    if (isTelegramMiniApp()) {
      const tgUser = getTelegramUser();
      if (tgUser?.photo_url) {
        setTgPhotoUrl(tgUser.photo_url);
      }
      
      // Check for saved TG user data
      const savedTgData = localStorage.getItem("tgUserData");
      if (savedTgData) {
        try {
          const tgUserData = JSON.parse(savedTgData);
          if (tgUserData.photoUrl) {
            setTgPhotoUrl(tgUserData.photoUrl);
          }
        } catch (e) {
          console.error("Error parsing TG user data", e);
        }
      }
    }
    
    const t = localStorage.getItem("accessToken");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    fetchData(t);
  }, []);

  const fetchData = async (t: string) => {
    try {
      setLoading(true);
      const [profileRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/user/me`, { headers: { Authorization: `Bearer ${t}` } }),
        axios.get(`${API_BASE_URL}/order/me`, { headers: { Authorization: `Bearer ${t}` } })
      ]);
      setProfile(profileRes.data);
      setFormData(profileRes.data);
      setOrders(ordersRes.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.removeItem("accessToken");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updateData: Partial<UserProfile>, showSuccess = true) => {
    try {
      await axios.patch(`${API_BASE_URL}/user/me`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(prev => ({ ...prev, ...updateData } as UserProfile));
      setIsEditing(false);
      if (showSuccess) alert("Muvaffaqiyatli saqlandi!");
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi");
    }
  };

  const mapStatus = (status: string) => {
    const sMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
      NEW: { label: "Yangi", color: "bg-blue-100 text-blue-800", icon: <Clock size={16} /> },
      ACCEPTED: { label: "Qabul qilingan", color: "bg-indigo-100 text-indigo-800", icon: <CheckCircle size={16} /> },
      ON_THE_WAY: { label: "Yo'lda", color: "bg-yellow-100 text-yellow-800", icon: <Truck size={16} /> },
      DELIVERED: { label: "Yetkazilgan", color: "bg-green-100 text-green-800", icon: <CheckCircle size={16} /> },
      CANCELLED: { label: "Bekor qilingan", color: "bg-red-100 text-red-800", icon: <XCircle size={16} /> }
    };
    return sMap[status] || { label: status, color: "bg-gray-100 text-gray-800", icon: <Package size={16} /> };
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-gray-600 hover:text-green-600 font-medium mb-6 transition-colors w-fit"
      >
        <ArrowLeft size={20} /> Asosiy sahifaga qaytish
      </button>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 text-center">
            {tgPhotoUrl ? (
              <img 
                src={tgPhotoUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-green-100"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                {profile?.fullName?.charAt(0).toUpperCase() || <UserCircle size={64} />}
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-800 mb-1">{profile?.fullName || 'Ism kiritilmagan'}</h2>
            {profile?.username && (
              <p className="text-green-600 font-medium mb-1">@{profile.username}</p>
            )}
            <p className="text-gray-500 font-medium">{profile?.number?.startsWith('tg_') ? 'Telegram orqali' : profile?.number}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => setActiveTab('info')}
              className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === 'info' ? 'bg-green-50 text-green-600 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
            >
              <div className="flex items-center gap-3 font-medium">
                <UserCircle size={20} />
                Shaxsiy ma'lumotlar
              </div>
              <ChevronRight size={18} className={activeTab === 'info' ? 'text-green-600' : 'text-gray-400'} />
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === 'orders' ? 'bg-green-50 text-green-600 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
            >
              <div className="flex items-center gap-3 font-medium">
                <ShoppingBag size={20} />
                Mening buyurtmalarim
              </div>
              <div className="flex items-center gap-2">
                {orders.length > 0 && (
                  <span className="bg-green-100 text-green-700 text-xs py-0.5 px-2 rounded-full font-bold">{orders.length}</span>
                )}
                <ChevronRight size={18} className={activeTab === 'orders' ? 'text-green-600' : 'text-gray-400'} />
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between p-4 transition-colors ${activeTab === 'settings' ? 'bg-green-50 text-green-600 border-l-4 border-green-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
            >
              <div className="flex items-center gap-3 font-medium">
                <Settings size={20} />
                Sozlamalar
              </div>
              <ChevronRight size={18} className={activeTab === 'settings' ? 'text-green-600' : 'text-gray-400'} />
            </button>
            
            <div className="h-px bg-gray-100 my-2"></div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 text-red-500 font-medium hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              Tizimdan chiqish
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          
          {/* TAB: INFO */}
          {activeTab === 'info' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-800">Shaxsiy ma'lumotlar</h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit2 size={16} /> Tahrirlash
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-100 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X size={16} /> Bekor qilish
                    </button>
                    <button 
                      onClick={() => handleUpdate(formData)} 
                      className="flex items-center gap-2 text-sm font-medium text-white bg-green-600 py-2 px-4 rounded-lg hover:bg-green-500 transition-colors shadow-sm shadow-green-200"
                    >
                      <Save size={16} /> Saqlash
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ism Familiya</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      value={formData.fullName || ''}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Masalan: Aliyev Vali"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Telefon raqam</label>
                    <input 
                      type="text" 
                      disabled
                      className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                      value={profile?.number || ''}
                    />
                    <p className="text-xs text-gray-400">Raqamni o'zgartirish mumkin emas</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Manzil</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      value={formData.address || ''}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="Shahar, Tuman, Ko'cha..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tug'ilgan sana</label>
                    <input 
                      type="date" 
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                      onChange={e => setFormData({...formData, dateOfBirth: e.target.value ? new Date(e.target.value).toISOString() : null})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Jinsi</label>
                    <select 
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                      value={formData.gender || ''}
                      onChange={e => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="">Tanlang</option>
                      <option value="MALE">Erkak</option>
                      <option value="FEMALE">Ayol</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4 hover:shadow-sm transition-shadow">
                    <div className="bg-white p-2 text-blue-500 rounded-lg shadow-sm"><UserCircle size={24} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Ism Familiya</p>
                      <p className="font-semibold text-gray-800">{profile?.fullName || "Kiritilmagan"}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4 hover:shadow-sm transition-shadow">
                    <div className="bg-white p-2 text-green-500 rounded-lg shadow-sm"><Phone size={24} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Telefon raqam</p>
                      <p className="font-semibold text-gray-800">{profile?.number}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4 md:col-span-2 hover:shadow-sm transition-shadow">
                    <div className="bg-white p-2 text-red-500 rounded-lg shadow-sm"><MapPin size={24} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Manzil</p>
                      <p className="font-semibold text-gray-800">{profile?.address || "Kiritilmagan"}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4 hover:shadow-sm transition-shadow">
                    <div className="bg-white p-2 text-purple-500 rounded-lg shadow-sm"><Calendar size={24} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Tug'ilgan sana</p>
                      <p className="font-semibold text-gray-800">
                        {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('uz-UZ') : "Kiritilmagan"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-start gap-4 hover:shadow-sm transition-shadow">
                    <div className="bg-white p-2 text-orange-500 rounded-lg shadow-sm"><UserCircle size={24} /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Jinsi</p>
                      <p className="font-semibold text-gray-800">
                        {profile?.gender === 'MALE' ? 'Erkak' : profile?.gender === 'FEMALE' ? 'Ayol' : "Kiritilmagan"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[500px]">
              <div className="border-b pb-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Mening buyurtmalarim</h3>
                <p className="text-gray-500 mt-1">Sizning barcha xaridlar tarixingiz shu yerda saqlanadi.</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={40} className="text-gray-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-700 mb-2">Buyurtmalar yo'q</h4>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">Siz hali hech narsa buyurtma qilmadingiz. Saytimizdagi mahsulotlarni ko'rib chiqing va xarid qiling.</p>
                  <button 
                    onClick={() => router.push('/')}
                    className="bg-green-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-green-500 transition-colors shadow-sm shadow-green-200"
                  >
                    Bosh sahifaga o'tish
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const st = mapStatus(order.orderStatus);
                    return (
                      <div key={order.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-lg text-gray-800">Buyurtma #{order.id}</span>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${st.color}`}>
                                {st.icon} {st.label}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                              <Calendar size={14} /> 
                              {new Date(order.createdAt).toLocaleString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="font-bold text-xl text-green-600">
                              {(order.summ + order.deliverySumm).toLocaleString()} so'm
                            </div>
                            <div className="text-xs font-semibold text-blue-500 mt-0.5">
                              {order.paymentType}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {order.productItems?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg pr-3 pl-1 py-1 border border-gray-100">
                              {item.photoUrl ? (
                                <img src={item.photoUrl.startsWith('/') ? `${API_BASE_URL}${item.photoUrl}` : `${API_BASE_URL}/ProductPhoto/${item.photoUrl}`} alt="p" className="w-8 h-8 rounded object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-xs"><Package size={14} className="text-gray-400"/></div>
                              )}
                              <div className="text-sm">
                                <span className="font-medium text-gray-800 line-clamp-1 max-w-[120px]">{item.name}</span>
                                <span className="text-xs text-gray-500 block">{item.count} ta x {item.price.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50/50 p-2 rounded-lg border border-blue-50">
                          <MapPin size={16} className="text-blue-500" />
                          <span className="line-clamp-1">{order.address}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[500px]">
              <div className="border-b pb-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Tizim sozlamalari</h3>
                <p className="text-gray-500 mt-1">Sayt tilini va boshqa sozlamalarni shu yerdan o'rnatishingiz mumkin.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm text-blue-500 h-fit">
                        <Globe size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-1">Muloqot tili</h4>
                        <p className="text-sm text-gray-500 max-w-sm">Tizim interfeysini va xabarnomalarni qaysi tilda ko'rsatishni xohlaysiz?</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => handleUpdate({ lang: 'UZ' }, false)}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-medium transition-all ${profile?.lang === 'UZ' ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                      >
                        🇺🇿 O'zbek
                      </button>
                      <button 
                        onClick={() => handleUpdate({ lang: 'RU' }, false)}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-medium transition-all ${profile?.lang === 'RU' ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                      >
                        🇷🇺 Русский
                      </button>
                      <button 
                        onClick={() => handleUpdate({ lang: 'EN' }, false)}
                        className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-medium transition-all ${profile?.lang === 'EN' ? 'bg-green-600 text-white shadow-md shadow-green-200' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                      >
                        🇬🇧 English
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
