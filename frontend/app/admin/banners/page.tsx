"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Image as ImageIcon,
  AlertCircle,
  X,
  Upload,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

interface Banner {
  id: number;
  image: string;
  title: string | null;
  link: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const MAX_BANNERS = 5;
const RECOMMENDED_WIDTH = 2458;
const RECOMMENDED_HEIGHT = 1024;

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  // Form states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bannerlarni yuklash
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/banner`);
      setBanners(res.data);
    } catch (error) {
      console.error("Bannerlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Modal ochish
  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setTitle(banner.title || "");
      setLink(banner.link || "");
      setIsActive(banner.isActive);
      setPreviewUrl(`${API_BASE_URL}${banner.image}`);
    } else {
      setEditingBanner(null);
      setTitle("");
      setLink("");
      setIsActive(true);
      setPreviewUrl(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  // Modal yopish
  const closeModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setImageFile(null);
    setPreviewUrl(null);
    setTitle("");
    setLink("");
    setIsActive(true);
  };

  // Rasm tanlash
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Fayl turini tekshirish
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("Faqat JPG, PNG yoki WebP formatdagi rasmlar qabul qilinadi");
        return;
      }

      // Fayl hajmini tekshirish (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Rasm hajmi 10MB dan oshmasligi kerak");
        return;
      }

      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Banner saqlash
  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingBanner && !imageFile) {
      alert("Iltimos, banner rasmini yuklang");
      return;
    }

    setUploading(true);

    try {
      if (editingBanner) {
        // Mavjud bannerni yangilash
        if (imageFile) {
          // Rasmni almashtirish
          const formData = new FormData();
          formData.append("image", imageFile);
          await axios.patch(`${API_BASE_URL}/admin/banner/${editingBanner.id}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        // Ma'lumotlarni yangilash
        await axios.patch(`${API_BASE_URL}/admin/banner/${editingBanner.id}`, {
          title: title || null,
          link: link || null,
          isActive,
        });
      } else {
        // Yangi banner qo'shish
        const formData = new FormData();
        formData.append("image", imageFile!);
        if (title) formData.append("title", title);
        if (link) formData.append("link", link);
        await axios.post(`${API_BASE_URL}/admin/banner`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      closeModal();
      fetchBanners();
    } catch (error: any) {
      const message = error.response?.data?.message || "Saqlashda xatolik yuz berdi";
      alert(message);
    } finally {
      setUploading(false);
    }
  };

  // Bannerni o'chirish
  const deleteBanner = async (id: number) => {
    if (!confirm("Haqiqatan ham bu bannerni o'chirmoqchimisiz?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/banner/${id}`);
      fetchBanners();
    } catch (error) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  // Holatni o'zgartirish
  const toggleStatus = async (banner: Banner) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/banner/${banner.id}`, {
        isActive: !banner.isActive,
      });
      fetchBanners();
    } catch (error) {
      alert("Holatni o'zgartirishda xatolik");
    }
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragging(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDragEnd = async () => {
    if (dragging !== null && dragOver !== null && dragging !== dragOver) {
      const newBanners = [...banners];
      const [removed] = newBanners.splice(dragging, 1);
      newBanners.splice(dragOver, 0, removed);

      setBanners(newBanners);

      // Serverga yangi tartibni yuborish
      try {
        await axios.post(`${API_BASE_URL}/admin/banner/reorder`, {
          orderedIds: newBanners.map((b) => b.id),
        });
      } catch (error) {
        console.error("Tartibni saqlashda xatolik:", error);
        fetchBanners(); // Xatolik bo'lsa eski holatga qaytarish
      }
    }

    setDragging(null);
    setDragOver(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bannerlar</h1>
          <p className="text-gray-500 mt-1">
            Saytdagi karusel bannerlarni boshqaring ({banners.length}/{MAX_BANNERS})
          </p>
        </div>
        <button
          onClick={() => openModal()}
          disabled={banners.length >= MAX_BANNERS}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold transition-colors"
        >
          <Plus size={20} />
          Yangi banner
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-blue-800 font-medium">Tavsiya etilgan o'lcham</p>
            <p className="text-blue-600 text-sm mt-1">
              Eng yaxshi ko'rinish uchun <strong>{RECOMMENDED_WIDTH}×{RECOMMENDED_HEIGHT}</strong> piksel o'lchamdagi rasmlarni yuklang.
              Banner har 2 sekundda avtomatik almashadi.
            </p>
          </div>
        </div>
      </div>

      {/* Banner list */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Hali banner yo'q</h3>
          <p className="text-gray-500 mb-4">
            Saytingizda ko'rsatiladigan bannerlarni qo'shing
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Plus size={18} />
            Banner qo'shish
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white rounded-xl border p-4 flex items-center gap-4 transition-all cursor-move ${
                dragging === index ? "opacity-50 scale-[0.98]" : ""
              } ${dragOver === index ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}
            >
              {/* Drag handle */}
              <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                <GripVertical size={24} />
              </div>

              {/* Preview */}
              <div className="w-32 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={`${API_BASE_URL}${banner.image}`}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">
                    {banner.title || `Banner #${index + 1}`}
                  </span>
                  {banner.link && (
                    <ExternalLink size={14} className="text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {banner.link || "Havolasiz"}
                </div>
              </div>

              {/* Status */}
              <button
                onClick={() => toggleStatus(banner)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  banner.isActive
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                <span className="hidden sm:inline">{banner.isActive ? "Faol" : "Nofaol"}</span>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal(banner)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Tahrirlash"
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  onClick={() => deleteBanner(banner.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="O'chirish"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBanner ? "Bannerni tahrirlash" : "Yangi banner"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={saveBanner} className="p-5 space-y-5">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner rasmi {!editingBanner && <span className="text-red-500">*</span>}
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-md transition-colors"
                    >
                      <RefreshCw size={14} />
                      Almashtirish
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-green-400 hover:bg-green-50 transition-colors"
                  >
                    <Upload size={32} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Rasm yuklash uchun bosing</span>
                    <span className="text-sm text-gray-400">
                      {RECOMMENDED_WIDTH}×{RECOMMENDED_HEIGHT} piksel tavsiya etiladi
                    </span>
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sarlavha (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Banner sarlavhasi"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Havola (ixtiyoriy)
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              {/* Status */}
              {editingBanner && (
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-700">
                    {isActive ? "Faol" : "Nofaol"}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={uploading || (!editingBanner && !imageFile)}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saqlanmoqda...
                    </>
                  ) : (
                    "Saqlash"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
