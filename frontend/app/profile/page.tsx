"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  UserCircle, 
  MapPin, 
  Calendar, 
  Phone,
  CheckCircle,
  Edit2,
  Save,
  X,
  MessageCircle,
  ExternalLink,
  Loader2,
  LogOut
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

export default function ProfilePage() {
  const router = useRouter();
  
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tgPhotoUrl, setTgPhotoUrl] = useState<string | null>(null);
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
      const profileRes = await axios.get(`${API_BASE_URL}/user/me`, { headers: { Authorization: `Bearer ${t}` } });
      setProfile(profileRes.data);
      setFormData(profileRes.data);
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Profile Card & Avatar */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          {tgPhotoUrl ? (
            <div className="relative">
              <img 
                src={tgPhotoUrl} 
                alt="Profile" 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-green-50 shadow-md"
              />
              <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile?.fullName?.charAt(0).toUpperCase() || <UserCircle size={48} />}
              </div>
              <div className="absolute bottom-1 right-1 bg-gray-300 w-5 h-5 rounded-full border-2 border-white"></div>
            </div>
          )}
          
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {profile?.fullName || 'Ism kiritilmagan'}
            </h2>
            <p className="text-gray-500 text-sm font-medium flex items-center justify-center sm:justify-start gap-1 pb-3">
              <Phone size={14} />
              {profile?.number?.startsWith('tg_') ? 'Telegram orqali' : profile?.number}
            </p>
          </div>
        </div>

        {/* Telegram Connection Block */}
        {!isTelegramMiniApp() && (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] p-5">
            {profile?.userId ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                    <MessageCircle size={24} className="fill-blue-100" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Telegram ulangan</h3>
                    <p className="text-blue-600 font-medium text-xs sm:text-sm mt-0.5">
                      {profile.username ? `@${profile.username}` : 'Muvaffaqiyatli'}
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 text-green-600 p-2 rounded-full hidden sm:block">
                  <CheckCircle size={20} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0">
                    <MessageCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Tizimga ulang</h3>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5 leading-tight">
                      Botdan xabarlarni tezroq oling
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleConnectTelegram}
                  disabled={linkingTelegram}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-xl transition-colors disabled:opacity-70"
                >
                  {linkingTelegram ? (
                    <><Loader2 size={18} className="animate-spin" /> Kuting...</>
                  ) : (
                    <><ExternalLink size={18} /> Ulanish</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Personal Details Form */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <h3 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
              <UserCircle size={20} className="text-green-600" />
              Shaxsiy ma'lumotlar
            </h3>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 py-1.5 px-3 rounded-lg transition-colors"
              >
                <Edit2 size={14} /> Tahrirlash
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="flex items-center justify-center text-gray-500 bg-gray-100 hover:bg-gray-200 p-1.5 w-8 h-8 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={() => handleUpdate(formData)} 
                  className="flex items-center gap-1.5 text-sm font-medium text-white bg-green-600 py-1.5 px-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  <Save size={14} /> Saqlash
                </button>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Ism Familiya</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-green-500/50 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-400"
                    value={formData.fullName || ''}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Masalan: Aliyev Vali"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Tug'ilgan sana</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-green-500/50 rounded-xl px-4 py-3 outline-none transition-all text-gray-700"
                    value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                    onChange={e => setFormData({...formData, dateOfBirth: e.target.value ? new Date(e.target.value).toISOString() : null})}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Manzil</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-green-500/50 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-gray-400"
                    value={formData.address || ''}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Shahar, tuman, mahalla..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Jinsi</label>
                  <select 
                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-green-500/50 rounded-xl px-4 py-3 outline-none transition-all text-gray-700 appearance-none"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 border border-gray-50 bg-gray-50/50 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm"><UserCircle size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">To'liq ism</p>
                    <p className="font-medium text-gray-900 truncate">{profile?.fullName || "Kiritilmagan"}</p>
                  </div>
                </div>
                <div className="p-3 border border-gray-50 bg-gray-50/50 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm"><Calendar size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Tug'ilgan sana</p>
                    <p className="font-medium text-gray-900">
                      {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('uz-UZ') : "Kiritilmagan"}
                    </p>
                  </div>
                </div>
                <div className="p-3 border border-gray-50 bg-gray-50/50 rounded-2xl flex items-center gap-3 sm:col-span-2">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm shrink-0"><MapPin size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Manzil</p>
                    <p className="font-medium text-gray-900 truncate">{profile?.address || "Kiritilmagan"}</p>
                  </div>
                </div>
                <div className="p-3 border border-gray-50 bg-gray-50/50 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm"><UserCircle size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Jinsi</p>
                    <p className="font-medium text-gray-900">
                      {profile?.gender === 'MALE' ? 'Erkak' : profile?.gender === 'FEMALE' ? 'Ayol' : "Kiritilmagan"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4 flex justify-center">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 text-red-500 font-medium bg-red-50 hover:bg-red-100 rounded-2xl transition-colors"
          >
            <LogOut size={18} />
            Akkauntdan chiqish
          </button>
        </div>

      </div>
    </div>
  );
}
