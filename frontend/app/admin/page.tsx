"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  RefreshCw,
  CheckCircle,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface DashboardStats {
  users: { total: number; today: number };
  orders: {
    total: number;
    today: number;
    week: number;
    month: number;
    new: number;
    accepted: number;
    onTheWay: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    today: number;
    week: number;
    month: number;
  };
  products: {
    total: number;
    active: number;
  };
}

interface SalesData {
  date?: string;
  week?: string;
  month?: string;
  orders: number;
  revenue: number;
  items: number;
}

interface TopProduct {
  productId: string;
  name: string;
  count: number;
  revenue: number;
  photoUrl: string | null;  // Backend hali photoUrl qaytaradi (analytics uchun)
}

interface OrderStatus {
  status: string;
  label: string;
  count: number;
}

interface PaymentType {
  type: string;
  label: string;
  count: number;
  revenue: number;
}

interface ProductSaleItem {
  productId: string;
  name: string;
  photoUrl: string | null;
  count: number;
  revenue: number;
  category: string;
}

interface DailySale {
  date: string;
  orders: number;
  items: number;
  revenue: number;
}

interface ProductSalesAnalytics {
  summary: {
    totalOrders: number;
    totalItems: number;
    totalRevenue: number;
    period: string;
  };
  products: ProductSaleItem[];
  daily: DailySale[];
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const formatCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toLocaleString();
};

const formatFullCurrency = (value: number) => {
  return value.toLocaleString() + " so'm";
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailySales, setDailySales] = useState<SalesData[]>([]);
  const [monthlySales, setMonthlySales] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [productSales, setProductSales] = useState<ProductSalesAnalytics | null>(null);
  const [productSalesPeriod, setProductSalesPeriod] = useState<"day" | "week" | "month" | "all">("all");
  const [productSalesLoading, setProductSalesLoading] = useState(false);

  const fetchProductSales = async (period: "day" | "week" | "month" | "all") => {
    try {
      setProductSalesLoading(true);
      const res = await axios.get(`${API_BASE_URL}/admin/analytics/products/sales?period=${period}`);
      setProductSales(res.data);
    } catch (err) {
      console.error("Product sales fetch error:", err);
    } finally {
      setProductSalesLoading(false);
    }
  };

  const handleProductSalesPeriodChange = (period: "day" | "week" | "month" | "all") => {
    setProductSalesPeriod(period);
    fetchProductSales(period);
  };

  const fetchAllData = async () => {
    try {
      const [
        statsRes,
        dailyRes,
        monthlyRes,
        topProductsRes,
        orderStatusRes,
        paymentTypesRes,
        productSalesRes,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/analytics/dashboard`),
        axios.get(`${API_BASE_URL}/admin/analytics/sales/daily?days=14`),
        axios.get(`${API_BASE_URL}/admin/analytics/sales/monthly?months=6`),
        axios.get(`${API_BASE_URL}/admin/analytics/products/top?limit=5`),
        axios.get(`${API_BASE_URL}/admin/analytics/orders/status`),
        axios.get(`${API_BASE_URL}/admin/analytics/orders/payment-types`),
        axios.get(`${API_BASE_URL}/admin/analytics/products/sales?period=${productSalesPeriod}`),
      ]);

      setStats(statsRes.data);
      setDailySales(dailyRes.data);
      setMonthlySales(monthlyRes.data);
      setTopProducts(topProductsRes.data);
      setOrderStatuses(orderStatusRes.data);
      setPaymentTypes(paymentTypesRes.data);
      setProductSales(productSalesRes.data);
    } catch (err) {
      console.error("Analytics data fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Analitika yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const salesData = salesPeriod === "daily" ? dailySales : monthlySales;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitika va Statistika</h1>
          <p className="text-gray-500 text-sm mt-1">Platformaning to'liq tahlili</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Yangilash
        </button>
      </div>

      {/* To'langan Buyurtmalar Analitikasi - Rasmga o'xshash dizayn */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header with Filter */}
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold">To'langan Buyurtmalar</h3>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex bg-slate-700/50 rounded-lg p-1 gap-1">
              {[
                { value: "day", label: "Bugun" },
                { value: "week", label: "Hafta" },
                { value: "month", label: "Oy" },
                { value: "all", label: "Hammasi" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleProductSalesPeriodChange(item.value as any)}
                  disabled={productSalesLoading}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    productSalesPeriod === item.value
                      ? "bg-green-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Jami savdo:</span>
            <span className="text-white font-bold">{productSales?.summary.totalOrders || 0} ta</span>
            <span className="text-slate-400">·</span>
            <span className="text-emerald-400 font-bold">
              {formatFullCurrency(productSales?.summary.totalRevenue || 0)}
            </span>
          </div>
        </div>

        {/* Products List */}
        <div className="max-h-[300px] overflow-y-auto">
          {productSalesLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
              <p className="text-slate-400 mt-2 text-sm">Yuklanmoqda...</p>
            </div>
          ) : productSales?.products.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              To'langan buyurtmalar topilmadi
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {productSales?.products.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/30 transition-colors"
                >
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    {product.photoUrl ? (
                      <img
                        src={product.photoUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-600"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center border border-slate-600">
                        <Package className="w-5 h-5 text-slate-500" />
                      </div>
                    )}
                    <span className="absolute -top-1 -left-1 w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    <p className="text-slate-400 text-xs">{product.category}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <span className="text-blue-400 font-bold">{product.count}</span>
                      <span className="text-slate-400 ml-1">ta</span>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <span className="text-emerald-400 font-bold">{formatCurrency(product.revenue)}</span>
                      <span className="text-slate-500 ml-1 text-xs">so'm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Stats - Oxirgi 7 kun */}
        {productSales?.daily && productSales.daily.length > 0 && (
          <div className="border-t border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm font-medium">Oxirgi 7 kun</span>
            </div>
            <div className="space-y-2">
              {productSales.daily.slice(-7).map((day) => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString("uz-UZ", { day: "numeric", month: "short" });
                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <span className="text-slate-300 text-sm font-medium w-20">{dayName}</span>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-400 font-bold">{day.orders}</span>
                        <span className="text-slate-500">ta</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">{day.items}</span>
                        <span className="text-slate-500">dona</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-[100px] justify-end">
                        <span className="text-emerald-400 font-bold">{formatCurrency(day.revenue)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Asosiy ko'rsatkichlar - Horizontal list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          {/* Users */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-gray-600">Jami userlar:</span>
            <span className="font-bold text-gray-900">{stats?.users.total || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span className="text-gray-600">Bugun qo'shilgan:</span>
            <span className="font-bold text-green-600">{stats?.users.today || 0}</span>
          </div>

          <div className="w-px h-5 bg-gray-200 hidden sm:block"></div>

          {/* Orders */}
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">Barcha buyurtmalar:</span>
            <span className="font-bold text-gray-900">{stats?.orders.total || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
            <span className="text-gray-600">Yangi:</span>
            <span className="font-bold text-orange-600">{stats?.orders.new || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            <span className="text-gray-600">Qabul qilingan:</span>
            <span className="font-bold text-yellow-600">{stats?.orders.accepted || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            <span className="text-gray-600">Yo'lda:</span>
            <span className="font-bold text-purple-600">{stats?.orders.onTheWay || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            <span className="text-gray-600">Yetkazilgan:</span>
            <span className="font-bold text-green-600">{stats?.orders.delivered || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span className="text-gray-600">Bekor qilingan:</span>
            <span className="font-bold text-red-600">{stats?.orders.cancelled || 0}</span>
          </div>

          <div className="w-px h-5 bg-gray-200 hidden sm:block"></div>

          {/* Products */}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" />
            <span className="text-gray-600">Barcha mahsulotlar:</span>
            <span className="font-bold text-gray-900">{stats?.products.total || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-gray-600">Aktivlari:</span>
            <span className="font-bold text-emerald-600">{stats?.products.active || 0}</span>
          </div>
        </div>
      </div>

      {/* Sotuvlar Grafigi va Top Mahsulotlar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sotuvlar Grafigi */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Sotuvlar Dinamikasi</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSalesPeriod("daily")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  salesPeriod === "daily"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Kunlik
              </button>
              <button
                onClick={() => setSalesPeriod("monthly")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  salesPeriod === "monthly"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Oylik
              </button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey={salesPeriod === "daily" ? "date" : "month"}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (salesPeriod === "daily") {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }
                    return value;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  formatter={(value) => [formatFullCurrency(Number(value) || 0), "Daromad"]}
                  labelFormatter={(label) => {
                    if (salesPeriod === "daily") {
                      return new Date(label).toLocaleDateString("uz-UZ");
                    }
                    return label;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Mahsulotlar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Eng ko'p sotilganlar</h3>
          </div>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Ma'lumot yo'q</p>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.count} dona sotildi</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Diagrammalar - Statuslar va To'lov turlari */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyurtma Statuslari */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Buyurtma Statuslari</h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={orderStatuses}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                  >
                    {orderStatuses.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {orderStatuses.map((status, index) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{status.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{status.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* To'lov Turlari */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">To'lov Turlari</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentTypes} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                <YAxis dataKey="label" type="category" width={60} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [formatFullCurrency(Number(value) || 0), "Daromad"]} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {paymentTypes.map((pt) => (
              <div key={pt.type} className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-gray-900">{pt.count}</p>
                <p className="text-xs text-gray-500">{pt.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}