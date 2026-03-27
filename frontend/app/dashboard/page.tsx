"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[50vh]">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 pb-4 border-b">Dashboard</h2>
      <p className="text-gray-600">Tizimga xush kelibsiz! Shaxsiy sahifangiz.</p>
    </div>
  );
}
