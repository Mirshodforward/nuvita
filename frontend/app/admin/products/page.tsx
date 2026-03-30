"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";

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
  photoUrl: string | null;
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
  const [file, setFile] = useState<File | null>(null);
  
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setFile(null);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      alert("Kategoriya tanlanmagan!");
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
      
      if (file) {
        formData.append("photo", file);
      }

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
                   {prod.photoUrl ? (
                     <img src={`${API_BASE_URL}${prod.photoUrl}`} alt={prod.name} className="h-12 w-12 rounded-md object-cover border" />
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
                <label className="block text-sm font-medium text-gray-700">Rasm yuklash</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
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