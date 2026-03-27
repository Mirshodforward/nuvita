"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface Staff {
  id: number;
  fullName: string;
  number: string;
  role: "ADMIN" | "COURIER";
  createdAt: string;
}

export default function StaffPage() {
  const router = useRouter();

  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [number, setNumber] = useState("+998");
  const [role, setRole] = useState<"ADMIN" | "COURIER">("COURIER");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/admin/staff`);
      setStaffList(res.data);
    } catch (err: any) {
      console.error(err);
      setError("Xodimlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/admin/staff`,
        { fullName, number, role }
      );

      // Reset form
      setFullName("");
      setNumber("+998");
      setRole("COURIER");

      // Refresh list
      fetchStaff();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Xodim yaratishda xatolik yuz berdi");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Xodimlar bo'limi (Admin / Kuryerlar)</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form qismi */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Yangi Xodim qo'shish</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">F.I.SH</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Eshmatov Toshmat"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Raqami</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="+998901234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Roli</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "COURIER")}
                className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="COURIER">Kuryer (COURIER)</option>
                <option value="ADMIN">Admin (ADMIN)</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {creating ? "Yaratilmoqda..." : "Qo'shish"}
          </button>
        </form>
      </div>

      {/* Ro'yxat */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b text-black">Xodimlar ro'yxati</h2>
        {loading ? (
          <div className="p-6 text-gray-500">Yuklanmoqda...</div>
        ) : staffList.length === 0 ? (
          <div className="p-6 text-gray-500">Xodimlar topilmadi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-4 text-black font-semibold">F.I.SH</th>
                  <th className="p-4 text-black font-semibold">Telefon Raqami</th>
                  <th className="p-4 text-black font-semibold">Roli</th>
                  <th className="p-4 text-black font-semibold">Qo'shilgan sana</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff) => (
                  <tr key={staff.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 text-gray-800">{staff.fullName || "-"}</td>
                    <td className="p-4 text-gray-800">{staff.number}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        staff.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(staff.createdAt).toLocaleDateString("uz-UZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
