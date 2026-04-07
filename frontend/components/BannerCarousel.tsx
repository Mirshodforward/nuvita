"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Banner {
  id: number;
  image: string;
  title: string | null;
  link: string | null;
  order: number;
}

const SLIDE_INTERVAL = 2000; // 2 sekund

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Bannerlarni yuklash
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/banner/active`);
        setBanners(res.data);
      } catch (error) {
        console.error("Bannerlarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Keyingi slaydga o'tish
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  // Oldingi slaydga o'tish
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // Avtomatik almashish
  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(nextSlide, SLIDE_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [banners.length, isPaused, nextSlide]);

  // Touch events (mobile swipe)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Loading yoki banner yo'q bo'lsa
  if (loading) {
    return (
      <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-100 animate-pulse rounded-2xl" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const BannerContent = ({ banner, index }: { banner: Banner; index: number }) => (
    <div
      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
        index === currentIndex
          ? "opacity-100 translate-x-0 scale-100"
          : index < currentIndex
          ? "opacity-0 -translate-x-full scale-95"
          : "opacity-0 translate-x-full scale-95"
      }`}
    >
      <img
        src={`${API_BASE_URL}${banner.image}`}
        alt={banner.title || `Banner ${index + 1}`}
        className="w-full h-full object-cover"
        loading={index === 0 ? "eager" : "lazy"}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div
        className="relative w-full h-48 sm:h-64 md:h-80 lg:h-[400px] rounded-2xl overflow-hidden shadow-lg group bg-gray-100"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slides */}
        {banners.map((banner, index) =>
          banner.link ? (
            <Link
              key={banner.id}
              href={banner.link}
              className="block"
              target={banner.link.startsWith("http") ? "_blank" : "_self"}
              rel={banner.link.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              <BannerContent banner={banner} index={index} />
            </Link>
          ) : (
            <BannerContent key={banner.id} banner={banner} index={index} />
          )
        )}

        {/* Navigation arrows (faqat 1+ banner bo'lsa) */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-105"
              aria-label="Oldingi banner"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-105"
              aria-label="Keyingi banner"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
            </button>
          </>
        )}

        {/* Dots indicator (faqat 1+ banner bo'lsa) */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-8 h-2.5 bg-white shadow-md"
                    : "w-2.5 h-2.5 bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Banner ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Progress bar */}
        {banners.length > 1 && !isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
            <div
              className="h-full bg-white/80 transition-all"
              style={{
                animation: `slideProgress ${SLIDE_INTERVAL}ms linear infinite`,
              }}
            />
          </div>
        )}
      </div>

      {/* CSS for progress animation */}
      <style jsx>{`
        @keyframes slideProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
