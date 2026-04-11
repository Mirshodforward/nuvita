import Link from "next/link";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";

export const metadata = {
  title: "Blog & Yangiliklar | Nuvita",
  description: "Nuvita mahsulotlari bilan sog'lom hayot tarzi, to'g'ri ovqatlanish va vitaminlar haqida eng so'nggi maqolalar va tavsiyalar.",
};

// Mock data for blog posts (Nuvita - health/vitamins context)
const blogPosts = [
  {
    id: 1,
    title: "Immunitetni qishga qanday tayyorlash kerak?",
    excerpt: "Qish mavsumida kasalliklarga chalinmaslik va immunitetni yuqori darajada ushlash sirlari. Asosiy vitaminlar va kundalik odatlar.",
    category: "Sog'lom hayot",
    date: "14 Oktabr, 2023",
    readTime: "5 daqiqa",
    author: "Nuvita Expert",
    imageUrl: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "immunitetni-qishga-tayyorlash",
  },
  {
    id: 2,
    title: "Vitamin D ning organizmdagi roli",
    excerpt: "Nima uchun quyosh nuri va D vitamini bizning organizmimiz uchun juda muhim? Uni yetishmovchiligini qanday aniqlash mumkin?",
    category: "Vitaminlar",
    date: "02 Noyabr, 2023",
    readTime: "4 daqiqa",
    author: "Shifokor Maslahati",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "vitamin-d-roli",
  },
  {
    id: 3,
    title: "Sportchilar uchun qo'shimchalar qanday tanlanadi?",
    excerpt: "Faol hayot tarzi bilan shug'ullanadigan insonlar va sportchilar uchun eng kerakli oziq-ovqat qo'shimchalari ro'yxati.",
    category: "Sport",
    date: "15 Dekabr, 2023",
    readTime: "6 daqiqa",
    author: "Sport Murabbiyi",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfe09ce18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "sportchilar-uchun-qoshimchalar",
  },
  {
    id: 4,
    title: "Bolalar uchun vitaminlar qancha yoshdan kerak?",
    excerpt: "Sog'lom va baquvvat ulg'ayishlari uchun bolalarga vitamin komplekslarini to'g'ri berish tartibi.",
    category: "Bolalar salomatligi",
    date: "05 Yanvar, 2024",
    readTime: "3 daqiqa",
    author: "Pediatr",
    imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    slug: "bolalar-uchun-vitaminlar",
  }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gray-50/50 pb-16">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Blog va Foydali <span className="text-green-600">Maqolalar</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Sog'lom hayot tarzi, to'g'ri ovqatlanish, sport va 
              organizm uchun kerakli vitaminlar haqida eng foydali ma'lumotlar.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article 
              key={post.id} 
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group"
            >
              {/* Image */}
              <Link href={`/blog/${post.slug}`} className="relative h-56 overflow-hidden block">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-white/90 backdrop-blur-sm text-green-600 font-medium text-xs px-3 py-1.5 rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>
              
              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-green-500" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-green-500" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-green-600 transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>
                
                <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-1">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <User size={12} />
                    </div>
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-1 text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
                  >
                    O'qish <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        {/* Pagination Skeleton/UI (mock) */}
        <div className="flex justify-center mt-12">
          <div className="inline-flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Oldingi</button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm">1</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">2</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">3</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Keyingi</button>
          </div>
        </div>
      </div>
    </main>
  );
}