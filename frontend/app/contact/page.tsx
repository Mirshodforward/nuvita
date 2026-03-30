"use client";

import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Send,
  CheckCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

const contactInfo = [
  {
    icon: Phone,
    title: "Telefon",
    value: "+998 90 123 45 67",
    link: "tel:+998901234567",
    description: "Har kuni 9:00 - 21:00"
  },
  {
    icon: Mail,
    title: "Email",
    value: "info@nuvita.uz",
    link: "mailto:info@nuvita.uz",
    description: "24 soat ichida javob beramiz"
  },
  {
    icon: MessageCircle,
    title: "Telegram",
    value: "@nuvitauzbot",
    link: "https://t.me/nuvitauzbot",
    description: "Tezkor javob va buyurtma"
  },
  {
    icon: MapPin,
    title: "Manzil",
    value: "Toshkent shahri",
    link: "https://maps.google.com/?q=Tashkent",
    description: "Chilonzor tumani, 1-kvartal"
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "+998",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSuccess(true);
    setLoading(false);
    setFormData({ name: "", phone: "+998", email: "", message: "" });
    
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">
      {/* Hero Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Biz bilan <span className="text-green-600">bog'laning</span>
            </h1>
            <p className="text-lg text-gray-600">
              Savollaringiz bormi? Biz har doim yordam berishga tayyormiz. 
              Quyidagi usullardan birini tanlang yoki xabar qoldiring.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {contactInfo.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target={item.link.startsWith('http') ? '_blank' : undefined}
                rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-200 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {item.title}
                </h3>
                <p className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                  {item.value}
                </p>
                <p className="text-sm text-gray-500">
                  {item.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      
           
    
    </div>
  );
}
