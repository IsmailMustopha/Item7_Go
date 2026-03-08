"use client";

import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Loader2,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import AdminOrderCard from "@/components/AdminOrderCard";
import { getSocket } from "@/lib/socket";
import { IUser } from "@/models/user.model";

// ... [IOrder Interface remains the same] ...
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

function ManageOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "delivered">(
    "all",
  );

  useEffect(() => {
    const getOrders = async () => {
      try {
        const result = await axios.get("/api/admin/get-orders");
        setOrders(result.data);
      } catch (error) {
        console.error("Error fetching admin orders:", error);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket?.on("new-order", (newOrder) => {
      setOrders((prev) => [newOrder, ...prev!]);
    });
    socket.on("order-assigned", ({ orderId, assignedDeliveryBoy }) => {
      setOrders((prev) =>
        prev?.map((o) =>
          o._id == orderId ? { ...o, assignedDeliveryBoy } : o,
        ),
      );
    });
    return () => {
      socket.off("new-order");
      socket.off("order-assigned");
    };
  }, []);

  // Filtered orders based on the active tab
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full pb-20">
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
                Order Log
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                Real-time Fulfillment
              </p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-5 pt-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              Syncing Orders...
            </p>
          </div>
        ) : (
          <>
            {/* Functional Filter Tabs */}
            <div className="flex items-center gap-3 mb-10 bg-slate-200/50 p-1.5 rounded-[1.5rem] w-fit">
              {[
                { id: "all", label: "All Orders", icon: Package },
                { id: "pending", label: "Pending", icon: Clock },
                { id: "delivered", label: "Delivered", icon: CheckCircle2 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Filter className="text-emerald-500" size={16} />
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Showing {activeTab} Orders
                  </h2>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-tighter">
                  {filteredOrders.length} Results
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={order._id?.toString() || index}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AdminOrderCard order={order} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 mt-6">
                <Package className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  No {activeTab} orders found
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ManageOrders;
