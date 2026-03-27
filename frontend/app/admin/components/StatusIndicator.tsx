"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, Database, Loader2 } from "lucide-react";

interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    api: { status: string };
    database: { status: string };
  };
}

export default function StatusIndicator() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://nuvita.uz/api"}/health`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
        setError(false);
      } else {
        setError(true);
        setHealth(null);
      }
    } catch {
      setError(true);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Har 30 sekundda tekshirish
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === "ok") return "bg-green-500";
    if (status === "degraded") return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusText = (status: string) => {
    if (status === "ok") return "Ishlayapti";
    if (status === "degraded") return "Qisman";
    return "Xato";
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-500">
        <Loader2 size={16} className="animate-spin" />
        <span>Tekshirilmoqda...</span>
      </div>
    );
  }

  if (error || !health) {
    return (
      <button
        onClick={checkHealth}
        className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-sm text-red-600 hover:bg-red-100 transition-colors"
      >
        <WifiOff size={16} />
        <span>Backend ulanmagan</span>
        <span className="text-xs text-red-400">(qayta tekshirish)</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Tizim holati
        </span>
        <button
          onClick={checkHealth}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Yangilash
        </button>
      </div>

      {/* API Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Wifi size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">API</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${getStatusColor(
              health.services.api.status
            )} animate-pulse`}
          />
          <span
            className={`text-xs font-medium ${
              health.services.api.status === "ok"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {getStatusText(health.services.api.status)}
          </span>
        </div>
      </div>

      {/* Database Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Database size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">Database</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${getStatusColor(
              health.services.database.status
            )} animate-pulse`}
          />
          <span
            className={`text-xs font-medium ${
              health.services.database.status === "ok"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {getStatusText(health.services.database.status)}
          </span>
        </div>
      </div>
    </div>
  );
}
