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
  MessageCircle,
  ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";
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

type TabType = 'info' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tgPhotoUrl, setTgPhotoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [linkingTelegram, setLinkingTelegram] = useState(false);

  useEffect(() => {
    let inTg = false;
    
    if (typeof window !== 'undefined') {
      inTg = isTelegramMiniApp();

      if (inTg) {
        const webApp = getTelegramWebApp();
        
        if (webApp?.BackButton) {
          webApp.BackButton.show();
          webApp.BackButton.onClick(() => {
            router.push('/');
          });
        }

        const tgUser = getTelegramUser();
        if (tgUser?.photo_url) {
          setTgPhotoUrl(tgUser.photo_url);
        }
        
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
    }

    return () => {
      if (inTg && typeof window !== 'undefined') {
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

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      NEW: { label: "Yangi", color: "bg-blue-100 text-blue-800", icon: <Clock size={16} /> },
      ACCEPTED: { label: "Qabul qilingan", color: "bg-indigo-100 text-indigo-800", icon: <CheckCircle size={16} /> },
      ON_THE_WAY: { label: "Yo'lda", color: "bg-yellow-100 text-yellow-800", icon: <Truck size={16} /> },
      DELIVERED: { label: "Yetkazilgan", color: "bg-green-100 text-green-800", icon: <CheckCircle size={16} /> },
      CANCELLED: { label: "Bekor qilingan", color: "bg-red-100 text-red-800", icon: <XCircle size={16} /> }
    };
    return statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800", icon: <Package size={16} /> };
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/");
  };

  // Handle connecting Telegram account
  const handleConnectTelegram = async () => {
    if (!token) return;
    
    setLinkingTelegram(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/user/telegram-link`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.linked) {
        // Already linked, refresh profile
        fetchData(token);
      } else if (res.data.link) {
        // Open Telegram bot link
        window.open(res.data.link, '_blank');
      }
    } catch (error) {
      console.error('Telegram link error:', error);
      alert('Xatolik yuz berdi');
    } finally {
      setLinkingTelegram(false);
    }
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

            {/* Telegram Connection Block */}
            {!isTelegramMiniApp() && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-4">
                {profile?.userId ? (
                  // Telegram is connected
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500 rounded-xl text-white">
                      <MessageCircle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Telegram ulangan</p>
                      <p className="font-semibold text-gray-800 truncate">
                        {profile.username ? `@${profile.username}` : 'Ulangan'}
                      </p>
                    </div>
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                  </div>
                ) : (
                  // Telegram not connected
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-gray-100 rounded-xl text-gray-400">
                        <MessageCircle size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">Telegram ulanmagan</p>
                        <p className="text-xs text-gray-500">Botdan xabarlarni olish uchun ulang</p>
                      </div>
                    </div>
                    <button
                      onClick={handleConnectTelegram}
                      disabled={linkingTelegram}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-all disabled:opacity-50"
                    >
                      {linkingTelegram ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Yuklanmoqda...
                        </>
                      ) : (
                        <>
                          <ExternalLink size={16} />
                          Telegram ulash
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

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
                  Shaxsiy ma&apos;lumotlar
                </div>
                <ChevronRight size={16} className={activeTab === 'info' ? 'text-green-600' : 'opacity-40'} />
              </button>
              <Link 
                href="/orders"
                className={`w-full flex items-center justify-between p-3.5 transition-colors text-gray-600 hover:bg-gray-50 border-l-4 border-transparent`}
              >
                <div className="flex items-center gap-3 font-medium text-sm">
                  <ShoppingBag size={18} />
                  Buyurtmalarim
                </div>
                <div className="flex items-center gap-2">
                  {orders.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-xs py-0.5 px-2 rounded-full font-bold">{orders.length}</span>
                  )}
                  <ChevronRight size={16} className={'opacity-40'} />
                </div>
              </Link>
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
                  <h3 className="text-xl font-bold text-gray-800">Shaxsiy ma&apos;lumotlar</h3>
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
                      <label className="text-sm font-medium text-gray-700">Tug&apos;ilgan sana</label>
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
                        <p className="text-xs font-medium mb-0.5 text-gray-500">Tug&apos;ilgan sana</p>
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
                    <div className={`p-4 rounded-xl flex items-center gap-4 ${profile?.userId ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <div className={`p-2.5 rounded-lg ${profile?.userId ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-200 text-gray-400'}`}>
                        <MessageCircle size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium mb-0.5 text-gray-500">Telegram</p>
                        <p className={`font-semibold ${profile?.userId ? 'text-blue-600' : 'text-gray-500'}`}>
                          {profile?.userId 
                            ? (profile.username ? `@${profile.username}` : 'Ulangan') 
                            : "Ulanmagan"}
                        </p>
                      </div>
                      {profile?.userId && (
                        <CheckCircle size={18} className="text-green-500" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 min-h-[400px]">
                <div className="pb-4 mb-5 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">Sozlamalar</h3>
                  <p className="text-sm mt-1 text-gray-500">Sayt tilini o&apos;zgartirish</p>
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
                          🇺🇿 O&apos;zbek
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
