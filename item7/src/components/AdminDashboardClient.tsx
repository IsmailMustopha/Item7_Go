"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Package,
  Truck,
  Users,
  TrendingUp,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

type propType = {
  earning: {
    today: number;
    sevenDays: number;
    total: number;
  };
  stats: {
    title: string;
    value: string;
  }[];
  chartData: {
    day: string;
    orders: number;
  }[];
};

function AdminDashboardClient({ earning, stats, chartData }: propType) {
  const [filter, setFilter] = useState<"today" | "sevenDays" | "total">(
    "today",
  );

  const currentEarning = earning[filter];
  const title = {
    today: "Today's Revenue",
    sevenDays: "Weekly Revenue",
    total: "Lifetime Revenue",
  }[filter];

  return (
    <div className="pt-24 pb-20 w-[95%] lg:w-[85%] max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="h-2 w-8 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Management Console
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Executive <span className="text-emerald-600">Overview</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {(["today", "sevenDays", "total"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === opt
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {opt === "sevenDays" ? "7 Days" : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Earning Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-emerald-900/20"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.4em] mb-3 flex items-center justify-center md:justify-start gap-2">
              <TrendingUp size={14} /> {title}
            </p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
              ₦{currentEarning.toLocaleString()}
            </h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 w-full md:w-auto">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <Wallet className="text-white" size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-300">
                  Wallet Balance
                </p>
                <p className="text-xl font-bold">Settled</p>
              </div>
            </div>
          </div>
        </div>
        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => {
          const icons = [
            <Package key="p" size={20} />,
            <Users key="u" size={20} />,
            <Truck key="t" size={20} />,
            <ArrowUpRight key="r" size={20} />,
          ];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  {icons[i]}
                </div>
                
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {s.title}
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {s.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Orders Analysis
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
              <Calendar size={12} /> Performance metrics for the last 7 days
            </p>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 900, fill: "#94a3b8" }}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "20px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px",
                }}
              />
              <Bar dataKey="orders" radius={[10, 10, 10, 10]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === chartData.length - 1 ? "#10b981" : "#e2e8f0"
                    }
                    className="hover:fill-emerald-400 transition-colors"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardClient;
