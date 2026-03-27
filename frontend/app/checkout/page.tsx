
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { MapPin, User, Phone, CheckCircle, CreditCard, ChevronLeft } from "lucide-react";
import Link from "next/link";

const REGIONS = [
  "Andijon", "Buxoro", "Farg`ona", "Jizzax", "Xorazm", 
  "Namangan", "Navoiy", "Qashqadaryo", "Qoraqalpog`iston", 
  "Samarqand", "Sirdaryo", "Surxondaryo", "Toshkent viloyati", "Toshkent shahri"
];

const PAYMENTS = [
  { id: "PAYME", title: "Payme", color: "border-gray-200 hover:border-teal-500", text: "text-teal-600" },
  { id: "CLICK", title: "Click", color: "border-gray-200 hover:border-blue-500", text: "text-blue-600" },
  { id: "CASH", title: "Naqd pul", color: "border-gray-200 hover:border-green-500", text: "text-green-600" }
];

export default function CheckoutPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [cart, setCart] = useState<{ count: number; summ: number } | null>(null);
  const [deliverySumm, setDeliverySumm] = useState<number>(30000);

  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    region: "",
    district: "",
    address: "",
    paymentType: "PAYME",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [profRes, cartRes, settRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/auth/profile`, { headers: { Authorization: "Bearer " + token } }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/cart`, { headers: { Authorization: "Bearer " + token } }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/admin/settings`)
        ]);

        const p = profRes.data;
        setProfile(p);
        setCart(cartRes.data);
        if (settRes.data && settRes.data.deliverySumm !== undefined) {
           setDeliverySumm(settRes.data.deliverySumm);
        }

        setFormData(prev => ({
          ...prev,
          fullName: p.fullName || "",
          contactNumber: p.number || "",
        }));

        if (cartRes.data.count === 0) {
            router.push("/cart");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.count === 0) return;
    
    setSubmitting(true);
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'https://nuvita.uz/api'}/order`, {
        deliveryAddress: `${formData.region}, ${formData.district}, ${formData.address}`,
        contactNumber: formData.contactNumber,
        paymentType: formData.paymentType,
      }, {
        headers: { Authorization: "Bearer " + token }
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-3">Qabul qilindi!</h2>
          <p className="text-gray-500 mb-8">Buyurtmangiz muvaffaqiyatli rasmiylashtirildi. Operator tez orada aloqaga chiqadi.</p>
          <button onClick={() => router.push("/orders")} className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3.5 rounded-xl transition">
            Buyurtmalarimni ko`rish
          </button>
        </div>
      </div>
    );
  }

  // Calculate actual sum
  const finalPrice = (cart?.summ || 0) + deliverySumm;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center">
            <Link href="/cart" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition">
                <ChevronLeft size={20} className="mr-1" /> Savatga qaytish
            </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-10">
          Buyurtmani rasmiylashtirish
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Main Form */}
          <div className="flex-1">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Shaxsiy Ma`lumotlar */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                   <div className="bg-gray-100 p-2.5 rounded-lg"><User size={20} className="text-gray-700"/></div>
                   <h2 className="text-xl font-medium text-gray-900">Shaxsiy ma`lumotlar</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ism familiya</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                      className="w-full bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 rounded-xl px-4 py-3.5 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon raqam</label>
                    <input required type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange}
                      className="w-full bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 rounded-xl px-4 py-3.5 outline-none transition" />
                  </div>
                </div>
              </section>

              {/* Yetkazib berish */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="bg-gray-100 p-2.5 rounded-lg"><MapPin size={20} className="text-gray-700"/></div>
                   <h2 className="text-xl font-medium text-gray-900">Yetkazib berish</h2>
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Viloyat</label>
                    <select required name="region" value={formData.region} onChange={handleChange}
                      className="w-full bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 rounded-xl px-4 py-3.5 outline-none transition appearance-none">
                      <option value="">Tanlang...</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tuman yoki Shahar</label>
                    <input required type="text" name="district" value={formData.district} onChange={handleChange} placeholder="Chilonzor tumani"
                      className="w-full bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 rounded-xl px-4 py-3.5 outline-none transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To`liq manzil (Ko`cha, uy)</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Mashrab ko`chasi, 12-uy"
                    className="w-full bg-gray-50 border border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 rounded-xl px-4 py-3.5 outline-none transition" />
                </div>
              </section>

              {/* To`lov usuli */}
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="bg-gray-100 p-2.5 rounded-lg"><CreditCard size={20} className="text-gray-700"/></div>
                   <h2 className="text-xl font-medium text-gray-900">To`lov usuli</h2>
                 </div>

                <div className="grid grid-cols-3 gap-4">
                  {PAYMENTS.map((payment) => {
                    const isSelected = formData.paymentType === payment.id;
                    return (
                        <label key={payment.id} className={`cursor-pointer border-2 rounded-2xl p-5 flex flex-col items-center justify-center transition-all ${isSelected ? "border-green-500 bg-green-50/30 ring-4 ring-green-50" : payment.color}`}>
                        <input
                            type="radio"
                            name="paymentType"
                            value={payment.id}
                            checked={isSelected}
                            onChange={handleChange}
                            className="hidden"
                        />
                        <span className={`font-semibold ${isSelected ? "text-green-700" : "text-gray-700"}`}>{payment.title}</span>
                        </label>
                    );
                  })}
                </div>
              </section>

            </form>
          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Xulosa</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Mahsulotlar ({cart?.count || 0} ta)</span>
                  <span className="font-medium text-gray-900">{cart?.summ?.toLocaleString()} so`m</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Yetkazib berish</span>
                  <span className="font-medium text-gray-900">{deliverySumm.toLocaleString()} so`m</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Jami to`lov</span>
                  <span className="text-2xl font-bold tracking-tight text-green-600">{finalPrice.toLocaleString()} so`m</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={submitting || cart?.count === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-2xl transition disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {submitting ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 
                     Kuting...
                   </>
                ) : (
                    "Tasdiqlash"
                )}
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-4">
                  Tasdiqlash tugmasini bosish orqali siz ommaviy ofertaga rozi bo`lasiz
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

