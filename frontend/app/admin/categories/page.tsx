"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/category`);
      setCategories(res.data);
    } catch (error) {
      console.error(error);
      alert("Kategoriyalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openForm = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id);
      setName(cat.name);
      setDescription(cat.description || "");
    } else {
      setEditingId(null);
      setName("");
      setDescription("");
    }
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setEditingId(null);
    setName("");
    setDescription("");
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(`${API_BASE_URL}/admin/category/${editingId}`, {
          name,
          description,
        });
      } else {
        await axios.post(`${API_BASE_URL}/admin/category`, {
          name,
          description,
        });
      }
      closeForm();
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || "Saqlashda xatolik yuz berdi");
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/category/${id}`, {
        isActive: !currentStatus,
      });
      fetchCategories();
    } catch (error) {
      alert("Holatni o'zgartirishda xatolik");
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/category/${id}`);
      fetchCategories();
    } catch (error) {
      alert("O'chirishda xatolik");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kategoriyalar</h1>
        <button
          onClick={() => openForm()}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500"
        >
          Yangi qo'shish
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qisqacha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holat</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Yuklanmoqda...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Hech narsa topilmadi</td>
              </tr>
            ) : (
             categories.map((cat) => (
              <tr key={cat.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.description || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={cat.isActive}
                        onChange={() => toggleStatus(cat.id, cat.isActive)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${cat.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${cat.isActive ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm font-medium text-gray-700">
                      {cat.isActive ? "Faol" : "Faol emas"}
                    </div>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openForm(cat)} className="text-blue-600 hover:text-blue-900 mr-4">
                    Tahrirlash
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="text-red-600 hover:text-red-900">
                    O'chirish
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Tahrirlash" : "Yangi qo'shish"}</h2>
            <form onSubmit={saveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kategoriya nomi</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 outline outline-1 outline-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tavsif (ixtiyoriy)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 outline outline-1 outline-gray-300 px-3 py-2"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                  Bekor qilish
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}