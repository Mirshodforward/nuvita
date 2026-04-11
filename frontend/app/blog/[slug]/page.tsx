import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, Share2 } from "lucide-react";

export default function BlogPostDetail({ params }: { params: { slug: string } }) {
  // Odatda bu yerda API yoki ma'lumotlar bazasidan chaqiriladi
  // slug: params.slug
  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white border-b border-gray-100 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 transition-colors mb-8 bg-green-50 px-4 py-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">Sog'lom hayot</span>
            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
              <Calendar size={16} />
              <span>14 Oktabr, 2023</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
              <Clock size={16} />
              <span>5 daqiqa o'qish</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-8">
            Maqola nomi: Hozircha bu demo sahifa
          </h1>
          
          <div className="flex items-center justify-between py-6 border-t border-b border-gray-100 mb-10">
            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <User size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Nuvita Expert</p>
                <p className="text-sm">Sog'lomlashtirish bo'yicha mutaxassis</p>
              </div>
            </div>
            
            <button className="p-3 text-gray-500 hover:text-green-600 bg-gray-50 hover:bg-green-50 rounded-full transition-all">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="bg-white rounded-3xl shadow-sm p-4 md:p-12 border border-gray-100">
          <img 
            src="https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Hero Image" 
            className="w-full h-80 md:h-[500px] object-cover rounded-2xl mb-12"
          />
          
          <article className="prose prose-lg prose-green max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-img:rounded-2xl">
            <p className="lead text-xl text-gray-500 font-medium">
              Bu yerda maqolaning qisqacha mazmuni yoziladi. Sog'lom hayot tarzi, to'g'ri ovqatlanish, 
              sport va organizm uchun kerakli vitaminlar.
            </p>
            
            <h2>Asosiy bo'lim</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
              ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
              laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in 
              voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            
            <h3>Nima qilish kerak?</h3>
            <ul className="list-disc pl-6 space-y-2 mb-8">
              <li>Ertalab erta turish</li>
              <li>Toza suv ichish</li>
              <li>Vitaminlar kompleksi qabul qilish</li>
              <li>Kechasi 8 soat uxlash</li>
            </ul>
            
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque 
              laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi 
              architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas 
              sit aspernatur aut odit aut fugit.
            </p>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-6 my-8 rounded-r-xl">
              <p className="m-0 font-medium text-green-900">
                "Sog'ligingiz — boyligingiz. Unga bugundan sarmoya kiritishni boshlang!" 
                <br />— Nuvita jamoasi
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}