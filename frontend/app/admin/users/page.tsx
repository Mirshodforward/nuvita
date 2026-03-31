"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { Users, X, Phone, Mail, MapPin, Calendar, Globe, ShoppingBag, Eye, ChevronLeft, ChevronRight } from "lucide-react";

interface User {
  id: number;
  number: string;
  fullName: string | null;
  username: string | null;
  email: string | null;
  createdAt: string;
  profileComplete: boolean;
}

interface UserDetail {
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
  role: string;
  createdAt: string;
  updatedAt: string;
  orders: {
    id: number;
    orderId: string;
    summ: number;
    orderStatus: string;
    createdAt: string;
  }[];
  _count: {
    orders: number;
  };
}

interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecentUsers();
  }, []);

  useEffect(() => {
    if (showAllUsers) {
      fetchAllUsers(currentPage);
    }
  }, [showAllUsers, currentPage]);

  const fetchRecentUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/users/recent?limit=10`);
      setRecentUsers(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Foydalanuvchilarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async (page: number) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/users?page=${page}&limit=20`);
      setAllUsers(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Foydalanuvchilarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      setModalLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/users/${userId}`);
      setSelectedUser(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Foydalanuvchi ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUserClick = (userId: number) => {
    fetchUserDetails(userId);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGenderText = (gender: string | null) => {
    if (!gender) return "-";
    return gender === "male" ? "Erkak" : gender === "female" ? "Ayol" : gender;
  };

  const getLangText = (lang: string) => {
    switch (lang) {
      case "UZ": return "O'zbekcha";
      case "RU": return "Ruscha";
      case "EN": return "Inglizcha";
      default: return lang;
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case "NEW": return "Yangi";
      case "ACCEPTED": return "Qabul qilindi";
      case "ON_THE_WAY": return "Yo'lda";
      case "DELIVERED": return "Yetkazildi";
      case "CANCELLED": return "Bekor qilindi";
      default: return status;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800";
      case "ACCEPTED": return "bg-yellow-100 text-yellow-800";
      case "ON_THE_WAY": return "bg-purple-100 text-purple-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const displayedUsers = showAllUsers ? (allUsers?.users || []) : recentUsers;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-8 h-8 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
        {allUsers && showAllUsers && (
          <span className="text-sm text-gray-500 ml-2">
            (Jami: {allUsers.total} ta)
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {showAllUsers ? "Barcha foydalanuvchilar" : "Oxirgi 10 ta foydalanuvchi"}
          </h2>
          {showAllUsers && (
            <button
              onClick={() => {
                setShowAllUsers(false);
                setCurrentPage(1);
              }}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              ← Oxirgi 10 taga qaytish
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-500 mt-3">Yuklanmoqda...</p>
          </div>
        ) : displayedUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Foydalanuvchilar topilmadi
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-gray-600 font-semibold">ID</th>
                    <th className="p-4 text-gray-600 font-semibold">Ism</th>
                    <th className="p-4 text-gray-600 font-semibold">Telefon</th>
                    <th className="p-4 text-gray-600 font-semibold">Email</th>
                    <th className="p-4 text-gray-600 font-semibold">Ro'yxatdan o'tgan</th>
                    <th className="p-4 text-gray-600 font-semibold">Profil</th>
                    <th className="p-4 text-gray-600 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleUserClick(user.id)}
                    >
                      <td className="p-4 text-gray-600">#{user.id}</td>
                      <td className="p-4 text-gray-800 font-medium">
                        {user.fullName || "-"}
                      </td>
                      <td className="p-4 text-gray-800">{user.number}</td>
                      <td className="p-4 text-gray-600">{user.email || "-"}</td>
                      <td className="p-4 text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            user.profileComplete
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.profileComplete ? "To'liq" : "To'liq emas"}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="text-green-600 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination or View All Button */}
            {showAllUsers && allUsers && allUsers.totalPages > 1 ? (
              <div className="p-4 border-t flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Sahifa {currentPage} / {allUsers.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(allUsers.totalPages, p + 1))}
                  disabled={currentPage === allUsers.totalPages}
                  className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : !showAllUsers ? (
              <div className="p-4 border-t text-center">
                <button
                  onClick={() => setShowAllUsers(true)}
                  className="bg-green-500 text-white px-6 py-2.5 rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Barcha foydalanuvchilarni ko'rish
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {(selectedUser || modalLoading) && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {modalLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-500 mt-3">Yuklanmoqda...</p>
              </div>
            ) : selectedUser ? (
              <>
                {/* Modal Header */}
                <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedUser.fullName || "Ism kiritilmagan"}
                    </h3>
                    <p className="text-sm text-gray-500">ID: #{selectedUser.id}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Telefon raqami</p>
                        <p className="text-gray-800 font-medium">{selectedUser.number}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-gray-800 font-medium">{selectedUser.email || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-xs text-gray-500">Manzil</p>
                        <p className="text-gray-800 font-medium">{selectedUser.address || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-500">Tug'ilgan sana</p>
                        <p className="text-gray-800 font-medium">
                          {selectedUser.dateOfBirth ? formatDate(selectedUser.dateOfBirth) : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Globe className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-xs text-gray-500">Til</p>
                        <p className="text-gray-800 font-medium">{getLangText(selectedUser.lang)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Users className="w-5 h-5 text-pink-600" />
                      <div>
                        <p className="text-xs text-gray-500">Jinsi</p>
                        <p className="text-gray-800 font-medium">{getGenderText(selectedUser.gender)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Telegram Info */}
                  {selectedUser.username && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-600 font-medium">Telegram</p>
                      <p className="text-gray-800">@{selectedUser.username}</p>
                    </div>
                  )}

                  {/* Orders Summary */}
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">
                        Buyurtmalar ({selectedUser._count.orders} ta)
                      </h4>
                    </div>

                    {selectedUser.orders.length > 0 ? (
                      <div className="space-y-3">
                        {selectedUser.orders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-800">
                                #{order.orderId.slice(0, 8)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-800">
                                {order.summ.toLocaleString()} so'm
                              </p>
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getOrderStatusColor(order.orderStatus)}`}
                              >
                                {getOrderStatusText(order.orderStatus)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Buyurtmalar topilmadi
                      </p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="border-t pt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Ro'yxatdan o'tgan: {formatDate(selectedUser.createdAt)}</span>
                    <span>Yangilangan: {formatDate(selectedUser.updatedAt)}</span>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
