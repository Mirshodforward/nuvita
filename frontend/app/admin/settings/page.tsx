"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminSettings() {
  const [deliverySumm, setDeliverySumm] = useState<number>(30000);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.deliverySumm) {
        setDeliverySumm(res.data.deliverySumm);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/admin/settings`, 
        { deliverySumm: Number(deliverySumm) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tizim Sozlamalari</h2>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yetkazib berish narxi (so'mda)
          </label>
          <input
            type="number"
            value={deliverySumm}
            onChange={(e) => setDeliverySumm(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            min="0"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Saqlanmoqda..." : "Saqlash"}
        </button>

        {success && (
          <p className="text-green-600 font-medium mt-4">Sozlamalar muvaffaqiyatli saqlandi!</p>
        )}
      </form>
    </div>
  );
}

