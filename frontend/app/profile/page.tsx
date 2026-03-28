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
  Globe
} from "lucide-react";
import { getTelegramUser, getTelegramWebApp, isTelegramMiniApp } from "@/lib/telegram";

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
    // Check if in TG Mini App
    const inTg = isTelegramMiniApp();

    if (inTg) {
      const webApp = getTelegramWebApp();
      
      // Configure BackButton
      if (webApp?.BackButton) {
        webApp.BackButton.show();
        webApp.BackButton.onClick(() => {
          router.push('/');
        });
      }

      // Get TG photo
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

    // Cleanup BackButton on unmount
    return () => {
      if (inTg) {
        const webApp = getTelegramWebApp();
        webApp?.BackButton?.hide();
      }
    };
  }, [router]);

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
      <div className="flex justify-center items-center h-64 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-4 text-center">
              {tgPhotoUrl ? (
                <img 
                  src={tgPhotoUrl} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-green-500/20"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold shadow-lg">
                  {profile?.fullName?.charAt(0).toUpperCase() || <UserCircle size={48} />}
                </div>
              )}
              <h2 className="text-lg font-bold mb-0.5 text-gray-800">
                {profile?.fullName || 'Ism kiritilmagan'}
              </h2>
              {profile?.username && (
                <p className="text-green-600 font-medium text-sm mb-0.5">@{profile.username}</p>
              )}
              <p className="text-sm text-gray-500">
                {profile?.number?.startsWith('tg_') ? 'Telegram orqali' : profile?.number}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <button 
                onClick={() => setActiveTab('info')}
                className={`w-full flex items-center justify-between p-3.5 transition-colors ${
                  activeTab === 'info' 
                    ? 'bg-green-500/10 text-green-600 border-l-4 border-green-600' 
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 font-medium text-sm">
                  <UserCircle size={18} />
                  Shaxsiy ma'lumotlar
                </div>
                <ChevronRight size={16} className={activeTab === 'info' ? 'text-green-600' : 'opacity-40'} />
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-3.5 transition-colors ${
                  activeTab === 'orders' 
                    ? 'bg-green-500/10 text-green-600 border-l-4 border-green-600' 
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 font-medium text-sm">
                  <ShoppingBag size={18} />
                  Buyurtmalarim
                </div>
                <div className="flex items-center gap-2">
                  {orders.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs py-0.5 px-2 rounded-full font-bold">{orders.length}</span>
                  )}
                  <ChevronRight size={16} className={activeTab === 'orders' ? 'text-green-600' : 'opacity-40'} />
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between p-3.5 transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-green-500/10 text-green-600 border-l-4 border-green-600' 
                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 font-medium text-sm">
                  <Settings size={18} />
                  Sozlamalar
                </div>
                <ChevronRight size={16} className={activeTab === 'settings' ? 'text-green-600' : 'opacity-40'} />
              </button>
              
              <div className="h-px my-1 bg-gray-100"></div>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3.5 text-red-500 font-medium hover:bg-red-50/50 transition-colors text-sm"
              >
                <LogOut size={18} />
                Chiqish
              </button>
            </div>
          </div>

        {/* Content Area */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          
          {/* TAB: INFO */}
          {activeTab === 'info' && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">
                  Shaxsiy ma'lumotlar
                </h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-500/10 py-2 px-3 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    <Edit2 size={14} /> Tahrirlash
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)} 
                      className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X size={14} /> Bekor
                    </button>
                    <button 
                      onClick={() => handleUpdate(formData)} 
                      className="flex items-center gap-1.5 text-sm font-medium text-white bg-green-600 py-2 px-3 rounded-lg hover:bg-green-500 transition-colors"
                    >
                      <Save size={14} /> Saqlash
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Ism Familiya</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      value={formData.fullName || ''}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Masalan: Aliyev Vali"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Telefon raqam</label>
                    <input 
                      type="text" 
                      disabled
                      className="w-full border-gray-200 bg-gray-50 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed"
                      value={profile?.number || ''}
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Manzil</label>
                    <input 
                      type="text" 
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      value={formData.address || ''}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="Shahar, Tuman, Ko'cha..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Tug'ilgan sana</label>
                    <input 
                      type="date" 
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                      value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                      onChange={e => setFormData({...formData, dateOfBirth: e.target.value ? new Date(e.target.value).toISOString() : null})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Jinsi</label>
                    <select 
                      className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg"><UserCircle size={22} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-0.5 text-gray-500">Ism Familiya</p>
                      <p className="font-semibold truncate text-gray-800">{profile?.fullName || "Kiritilmagan"}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-2.5 bg-green-500/10 text-green-500 rounded-lg"><Phone size={22} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-0.5 text-gray-500">Telefon raqam</p>
                      <p className="font-semibold truncate text-gray-800">{profile?.number}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 sm:col-span-2">
                    <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg"><MapPin size={22} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-0.5 text-gray-500">Manzil</p>
                      <p className="font-semibold truncate text-gray-800">{profile?.address || "Kiritilmagan"}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-lg"><Calendar size={22} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-0.5 text-gray-500">Tug'ilgan sana</p>
                      <p className="font-semibold text-gray-800">
                        {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('uz-UZ') : "Kiritilmagan"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                    <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-lg"><UserCircle size={22} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium mb-0.5 text-gray-500">Jinsi</p>
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
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 min-h-[400px]">
              <div className="pb-4 mb-5 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">Buyurtmalarim</h3>
                <p className="text-sm mt-1 text-gray-500">Barcha xaridlar tarixi</p>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={32} className="text-gray-300" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-gray-700">Buyurtmalar yo'q</h4>
                  <p className="text-sm mb-5 max-w-xs mx-auto text-gray-500">
                    Siz hali hech narsa buyurtma qilmadingiz.
                  </p>
                  <button 
                    onClick={() => router.push('/')}
                    className="bg-green-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-green-500 transition-colors text-sm"
                  >
                    Xarid qilish
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const st = mapStatus(order.orderStatus);
                    return (
                      <div key={order.id} className="border border-gray-100 bg-white rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-gray-800">#{order.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${st.color}`}>
                                {st.icon} {st.label}
                              </span>
                            </div>
                            <div className="text-xs mt-1 flex items-center gap-1.5 text-gray-500">
                              <Calendar size={12} /> 
                              {new Date(order.createdAt).toLocaleString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="font-bold text-green-600">
                              {(order.summ + order.deliverySumm).toLocaleString()} so'm
                            </div>
                            <div className="text-xs text-blue-500 font-medium">
                              {order.paymentType}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {order.productItems?.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-100 flex items-center gap-1.5 rounded-lg pr-2 pl-1 py-1 text-xs">
                              {item.photoUrl ? (
                                <img src={item.photoUrl.startsWith('/') ? `${API_BASE_URL}${item.photoUrl}` : `${API_BASE_URL}/ProductPhoto/${item.photoUrl}`} alt="p" className="w-6 h-6 rounded object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center"><Package size={12} className="text-gray-400"/></div>
                              )}
                              <span className="font-medium truncate max-w-[80px] text-gray-800">{item.name}</span>
                              <span className="text-gray-500">×{item.count}</span>
                            </div>
                          ))}
                          {order.productItems?.length > 3 && (
                            <span className="bg-gray-50 text-gray-500 px-2 py-1 rounded-lg text-xs font-medium">
                              +{order.productItems.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <div className="bg-blue-50 text-blue-600 flex items-center gap-1.5 text-xs p-2 rounded-lg">
                          <MapPin size={12} />
                          <span className="truncate">{order.address}</span>
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
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 min-h-[400px]">
              <div className="pb-4 mb-5 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">Sozlamalar</h3>
                <p className="text-sm mt-1 text-gray-500">Sayt tilini o'zgartirish</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 h-fit">
                        <Globe size={22} />
                      </div>
                      <div>
                        <h4 className="font-bold mb-0.5 text-gray-800">Til</h4>
                        <p className="text-xs text-gray-500">Interfeys tili</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleUpdate({ lang: 'UZ' }, false)}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium transition-all ${profile?.lang === 'UZ' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                      >
                        🇺🇿 O'zbek
                      </button>
                      <button 
                        onClick={() => handleUpdate({ lang: 'RU' }, false)}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium transition-all ${profile?.lang === 'RU' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
                      >
                        🇷🇺 Русский
                      </button>
                      <button 
                        onClick={() => handleUpdate({ lang: 'EN' }, false)}
                        className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-sm font-medium transition-all ${profile?.lang === 'EN' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
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
  </div>
  );
}
