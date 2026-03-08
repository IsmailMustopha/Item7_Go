"use client";

import UserOrderCard from "@/components/UserOrderCard";
import axios from "axios";
import {
  ArrowLeft,
  PackageSearch,
  Loader2,
  ShoppingBag,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IUser } from "@/models/user.model";
import { getSocket } from "@/lib/socket";


interface IOrder {
  _id?: string;
  user: string;
  items: [
    {
      food: string;
      name: string;
      price: string;
      image: string;
      quantity: number;
    },
  ];
  totalAmount: number;
  isPaid: boolean;
  paymentMethod: "cod" | "online";
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  assignedDeliveryBoy?: IUser;
  assignment?: string;
  status: "pending" | "out of delivery" | "delivered";
  createdAt?: Date;
  updatedAt?: Date;
}


const MyOrder = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "delivered" | "out of delivery">("all");
  const router = useRouter();

  useEffect(() => {
    const getMyOrders = async () => {
      try {
        const result = await axios.get("/api/user/my-orders");
        const data = Array.isArray(result.data) ? result.data : [result.data];
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    getMyOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status?.toLowerCase() === filter;
  });

  useEffect(() => {
    const socket = getSocket();
    socket.on("order-assigned", ({ orderId, assignedDeliveryBoy }) => {
      setOrders((prev) =>
        prev?.map((o) =>
          o._id == orderId ? { ...o, assignedDeliveryBoy } : o,
        ),
      );
    });

    return () => {
      socket.off("order-assigned");
    };
  }, []);

  return (
    <div className="bg-[#F8FAFC] min-h-screen w-full pb-24">
      <nav className="fixed top-0 left-0 w-full backdrop-blur-xl bg-white/70 border-b border-slate-200/60 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-5">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 hover:text-emerald-600 transition-all"
              onClick={() => router.push("/")}
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                My Orders
              </h1>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-1.5">
                Track your cravings
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700">
              {orders.length} Total
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 pt-32">
        {!loading && orders.length > 0 && (
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="p-2 bg-slate-100 rounded-xl mr-1">
              <Filter size={16} className="text-slate-500" />
            </div>
            {(["all", "pending", "delivered", "out of delivery"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-6 py-2.5 rounded-2xl text-sm font-bold capitalize transition-all whitespace-nowrap ${
                    filter === tab
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-emerald-100 rounded-full" />
            </div>
            <p className="mt-6 font-bold text-slate-400 animate-pulse tracking-wide uppercase text-[10px]">
              Loading History
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 px-10"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 rotate-3">
                  <PackageSearch size={48} className="text-slate-300" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  No data found
                </h2>
                <p className="text-slate-500 mt-4 max-w-xs mx-auto font-medium leading-relaxed">
                  {filter === "all"
                    ? "You haven't placed any orders yet. Let's fix that!"
                    : `You have no ${filter} orders at the moment.`}
                </p>
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-10 bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-3"
                  >
                    <ShoppingBag size={20} />
                    Explore Menu
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredOrders.map((order, index) => (
                  <motion.div
                    key={order._id?.toString() || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.05,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <UserOrderCard order={order} />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MyOrder;
