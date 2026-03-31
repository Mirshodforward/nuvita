"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { X, Plus, Image as ImageIcon, Star } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface ProductTranslation {
  id: number;
  lang: 'RU' | 'EN';
  name: string;
  ingredients: string | null;
  uses: string | null;
  description: string | null;
}

interface Product {
  id: number;
  productId: string;
  name: string;
  photos: string[];
  category: string;
  ingredients: string | null;
  uses: string | null;
  description: string | null;
  price: number;
  amount: number;
  isActive: boolean;
  createdAt: string;
  translations?: ProductTranslation[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states - UZ (default)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [ingredients, setIngredients] = useState("");
  const [uses, setUses] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  
  // Form states - RU
  const [nameRu, setNameRu] = useState("");
  const [ingredientsRu, setIngredientsRu] = useState("");
  const [usesRu, setUsesRu] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  
  // Form states - EN
  const [nameEn, setNameEn] = useState("");
  const [ingredientsEn, setIngredientsEn] = useState("");
  const [usesEn, setUsesEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/product`);
      setProducts(res.data);
    } catch (error) {
      console.error(error);
      alert("Mahsulotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/category`);
      // filter only active ones for form if needed, or show all
      setCategories(res.data.filter((c: any) => c.isActive));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openForm = (prod?: Product) => {
    if (prod) {
      setEditingId(prod.id);
      setName(prod.name);
      setCategory(prod.category);
      setPrice(prod.price);
      setAmount(prod.amount);
      setIngredients(prod.ingredients || "");
      setUses(prod.uses || "");
      setDescription(prod.description || "");
      setExistingPhotos(prod.photos || []);
      
      // RU translation
      const ruTrans = prod.translations?.find(t => t.lang === 'RU');
      setNameRu(ruTrans?.name || "");
      setIngredientsRu(ruTrans?.ingredients || "");
      setUsesRu(ruTrans?.uses || "");
      setDescriptionRu(ruTrans?.description || "");
      
      // EN translation
      const enTrans = prod.translations?.find(t => t.lang === 'EN');
      setNameEn(enTrans?.name || "");
      setIngredientsEn(enTrans?.ingredients || "");
      setUsesEn(enTrans?.uses || "");
      setDescriptionEn(enTrans?.description || "");
    } else {
      setEditingId(null);
      setName("");
      setCategory(categories[0]?.name || "");
      setPrice(0);
      setAmount(0);
      setIngredients("");
      setUses("");
      setDescription("");
      setExistingPhotos([]);
      // Reset RU
      setNameRu("");
      setIngredientsRu("");
      setUsesRu("");
      setDescriptionRu("");
      // Reset EN
      setNameEn("");
      setIngredientsEn("");
      setUsesEn("");
      setDescriptionEn("");
    }
    setFiles([]);
    // Reset all file inputs
    fileInputRefs.current.forEach(input => {
      if (input) input.value = "";
    });
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setFiles([]);
    setExistingPhotos([]);
  };

  // Belgilangan slotga rasm qo'shish
  const handleFileAddToSlot = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;

    // Kombinatsiyalangan rasmlar ro'yxatini yaratish
    const allPhotos = [...existingPhotos.map(p => ({ type: 'existing' as const, value: p })), 
                       ...files.map(f => ({ type: 'new' as const, value: f }))];
    
    if (slotIndex < allPhotos.length) {
      // Mavjud slotni almashtirish
      if (slotIndex < existingPhotos.length) {
        // Existing photo'ni o'chirish va file qo'shish
        const newExisting = [...existingPhotos];
        newExisting.splice(slotIndex, 1);
        setExistingPhotos(newExisting);
        
        // Yangi faylni to'g'ri pozitsiyaga qo'shish
        const insertIndex = slotIndex;
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles.splice(insertIndex, 0, newFile);
          return newFiles;
        });
      } else {
        // File'ni almashtirish
        const fileIndex = slotIndex - existingPhotos.length;
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[fileIndex] = newFile;
          return newFiles;
        });
      }
    } else {
      // Yangi slot - oxiriga qo'shish
      setFiles(prev => [...prev, newFile]);
    }

    // Input'ni tozalash
    if (fileInputRefs.current[slotIndex]) {
      fileInputRefs.current[slotIndex]!.value = "";
    }
  };

  const removePhotoAtIndex = (index: number) => {
    if (index < existingPhotos.length) {
      setExistingPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingPhotos.length;
      setFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  // Rasmlarni birlashtirish (existing + new)
  const getAllPhotos = () => {
    const combined: { type: 'existing' | 'new'; value: string | File; index: number }[] = [];
    existingPhotos.forEach((p, i) => combined.push({ type: 'existing', value: p, index: i }));
    files.forEach((f, i) => combined.push({ type: 'new', value: f, index: existingPhotos.length + i }));
    return combined;
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      alert("Kategoriya tanlanmagan!");
      return;
    }
    
    // Yangi mahsulot uchun kamida 1 ta rasm kerak
    if (!editingId && files.length === 0) {
      alert("Kamida 1 ta rasm yuklang!");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price.toString());
      formData.append("amount", amount.toString());
      formData.append("ingredients", ingredients);
      formData.append("uses", uses);
      formData.append("description", description);
      
      // RU translations
      if (nameRu) formData.append("nameRu", nameRu);
      if (ingredientsRu) formData.append("ingredientsRu", ingredientsRu);
      if (usesRu) formData.append("usesRu", usesRu);
      if (descriptionRu) formData.append("descriptionRu", descriptionRu);
      
      // EN translations
      if (nameEn) formData.append("nameEn", nameEn);
      if (ingredientsEn) formData.append("ingredientsEn", ingredientsEn);
      if (usesEn) formData.append("usesEn", usesEn);
      if (descriptionEn) formData.append("descriptionEn", descriptionEn);
      
      // Mavjud rasmlarni yuborish (tahrirlashda saqlanishi kerak bo'lganlar)
      if (existingPhotos.length > 0) {
        formData.append("existingPhotos", JSON.stringify(existingPhotos));
      }
      
      // Yangi rasmlarni yuklash
      files.forEach((file) => {
        formData.append("photos", file);
      });

      if (editingId) {
        await axios.patch(`${API_BASE_URL}/admin/product/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await axios.post(`${API_BASE_URL}/admin/product`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      closeForm();
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || "Saqlashda xatolik yuz berdi");
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/product/${id}`, {
        isActive: !currentStatus,
      });
      fetchProducts();
    } catch (error) {
      alert("Holatni o'zgartirishda xatolik");
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/product/${id}`);
      fetchProducts();
    } catch (error) {
      alert("O'chirishda xatolik");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mahsulotlar</h1>
        <button
          onClick={() => openForm()}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500"
        >
          Yangi mahsulot
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rasm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomi / Kategoriya</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Narx / Miqdor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holat</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amallar</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Yuklanmoqda...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Hech qanday mahsulot topilmadi</td>
              </tr>
            ) : (
             products.map((prod) => (
              <tr key={prod.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                   {prod.photos && prod.photos.length > 0 ? (
                     <div className="relative">
                       <img src={`${API_BASE_URL}${prod.photos[0]}`} alt={prod.name} className="h-12 w-12 rounded-md object-cover border" />
                       {prod.photos.length > 1 && (
                         <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                           {prod.photos.length}
                         </span>
                       )}
                     </div>
                   ) : (
                     <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-400 text-xs">Yo'q</div>
                   )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{prod.name}</div>
                  <div className="text-sm text-gray-500">{prod.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{prod.price} so'm</div>
                  <div className="text-sm text-gray-500">{prod.amount} ta qolgan</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={prod.isActive}
                        onChange={() => toggleStatus(prod.id, prod.isActive)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${prod.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${prod.isActive ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm font-medium text-gray-700">
                      {prod.isActive ? "Faol" : "Faol emas"}
                    </div>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openForm(prod)} className="text-blue-600 hover:text-blue-900 mr-4">
                    Tahrirlash
                  </button>
                  <button onClick={() => deleteProduct(prod.id)} className="text-red-600 hover:text-red-900">
                    O'chirish
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingId ? "Tahrirlash" : "Yangi mahsulot"}</h2>
            <form onSubmit={saveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mahsulot rasmlari (1-5 ta)
                </label>
                
                {/* 5 ta rasm sloti */}
                <div className="grid grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map((slotIndex) => {
                    const allPhotos = getAllPhotos();
                    const photo = allPhotos[slotIndex];
                    const isMain = slotIndex === 0;
                    const hasPhoto = !!photo;
                    
                    return (
                      <div key={slotIndex} className="relative">
                        {/* Hidden file input */}
                        <input
                          type="file"
                          accept="image/*"
                          ref={el => { fileInputRefs.current[slotIndex] = el; }}
                          onChange={(e) => handleFileAddToSlot(e, slotIndex)}
                          className="hidden"
                          id={`photo-slot-${slotIndex}`}
                        />
                        
                        {hasPhoto ? (
                          /* Rasm mavjud */
                          <div className={`relative aspect-square rounded-xl overflow-hidden border-2 ${isMain ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200'} group`}>
                            <img
                              src={photo.type === 'existing' 
                                ? `${API_BASE_URL}${photo.value}` 
                                : URL.createObjectURL(photo.value as File)}
                              alt={`Rasm ${slotIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Asosiy rasm belgisi */}
                            {isMain && (
                              <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                                <Star size={10} fill="white" />
                                <span>Asosiy</span>
                              </div>
                            )}
                            
                            {/* Tartib raqami */}
                            <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                              {slotIndex + 1}
                            </div>
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {/* Almashtirish */}
                              <label
                                htmlFor={`photo-slot-${slotIndex}`}
                                className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                                title="Almashtirish"
                              >
                                <ImageIcon size={14} className="text-gray-700" />
                              </label>
                              {/* O'chirish */}
                              <button
                                type="button"
                                onClick={() => removePhotoAtIndex(slotIndex)}
                                className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                title="O'chirish"
                              >
                                <X size={14} className="text-white" />
                              </button>
                            </div>
                            
                            {/* Yangi rasm belgisi */}
                            {photo.type === 'new' && (
                              <div className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] px-1 py-0.5 rounded">
                                Yangi
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Bo'sh slot */
                          <label
                            htmlFor={`photo-slot-${slotIndex}`}
                            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                              ${isMain 
                                ? 'border-green-400 bg-green-50 hover:bg-green-100 hover:border-green-500' 
                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}`}
                          >
                            <Plus size={20} className={isMain ? 'text-green-500' : 'text-gray-400'} />
                            <span className={`text-xs mt-1 font-medium ${isMain ? 'text-green-600' : 'text-gray-500'}`}>
                              {isMain ? 'Asosiy' : `Rasm ${slotIndex + 1}`}
                            </span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Ma'lumot */}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Star size={12} className="text-green-500" />
                    Birinchi rasm asosiy rasm sifatida hamma joyda ko'rsatiladi
                  </p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    getAllPhotos().length === 0 
                      ? 'bg-red-100 text-red-600' 
                      : getAllPhotos().length < 3 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-green-100 text-green-700'
                  }`}>
                    {getAllPhotos().length}/5 ta rasm
                  </span>
                </div>
              </div>

              {/* UZ (Default) */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-green-700 mb-1">🇺🇿 O'zbekcha (asosiy)</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nomi (UZ)</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 outline outline-1 outline-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Kategoriya</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2 bg-white"
                >
                  <option value="" disabled>Tanlang...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Narxi (so'm)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Miqdori (Omborda)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Tarkibi (Ingredients) - UZ</label>
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                  rows={2}
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Ishlatilishi (Uses) - UZ</label>
                <textarea
                  value={uses}
                  onChange={(e) => setUses(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                  rows={2}
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Qo'shimcha tavsif (Description) - UZ</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                  rows={3}
                ></textarea>
              </div>

              {/* RU Translations */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h3 className="text-lg font-semibold text-blue-700 mb-3">🇷🇺 Ruscha tarjima</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nomi (RU)</label>
                <input
                  type="text"
                  value={nameRu}
                  onChange={(e) => setNameRu(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 outline outline-1 outline-gray-300 px-3 py-2"
                  placeholder="Название продукта"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Tarkibi (RU)</label>
                <textarea
                  value={ingredientsRu}
                  onChange={(e) => setIngredientsRu(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                  rows={2}
                  placeholder="Состав"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Ishlatilishi (RU)</label>
                <textarea
                  value={usesRu}
                  onChange={(e) => setUsesRu(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                  rows={2}
                  placeholder="Применение"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Tavsif (RU)</label>
                <textarea
                  value={descriptionRu}
                  onChange={(e) => setDescriptionRu(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                  rows={2}
                  placeholder="Описание"
                ></textarea>
              </div>

              {/* EN Translations */}
              <div className="md:col-span-2 border-t pt-4 mt-2">
                <h3 className="text-lg font-semibold text-purple-700 mb-3">🇬🇧 Inglizcha tarjima</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nomi (EN)</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 outline outline-1 outline-gray-300 px-3 py-2"
                  placeholder="Product name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Tarkibi (EN)</label>
                <textarea
                  value={ingredientsEn}
                  onChange={(e) => setIngredientsEn(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                  rows={2}
                  placeholder="Ingredients"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Ishlatilishi (EN)</label>
                <textarea
                  value={usesEn}
                  onChange={(e) => setUsesEn(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                  rows={2}
                  placeholder="Uses"
                ></textarea>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Tavsif (EN)</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm outline outline-1 outline-gray-300 px-3 py-2"
                  rows={2}
                  placeholder="Description"
                ></textarea>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={closeForm} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium">
                  Bekor qilish
                </button>
                <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-sm">
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