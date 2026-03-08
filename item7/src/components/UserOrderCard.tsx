"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CreditCard,
  MapPin,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  Calendar,
  UserCheck,
  Phone,
  PhoneOutgoing,
  Info,
} from "lucide-react";
import Image from "next/image";
import { getSocket } from "@/lib/socket";
import { IUser } from "@/models/user.model";
import { useRouter } from "next/navigation";

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

const UserOrderCard = ({ order }: { order: IOrder }) => {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(order.status);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-amber-50 text-amber-600 border-amber-200",
          icon: <Clock size={14} className="animate-pulse" />,
          label: "Preparing",
        };
      case "out of delivery":
        return {
          color: "bg-blue-50 text-blue-600 border-blue-200",
          icon: <Truck size={14} className="animate-bounce" />,
          label: "On the way",
        };
      case "delivered":
        return {
          color: "bg-emerald-50 text-emerald-600 border-emerald-200",
          icon: <CheckCircle2 size={14} />,
          label: "Delivered",
        };
      default:
        return {
          color: "bg-slate-50 text-slate-600 border-slate-200",
          icon: <Package size={14} />,
          label: status,
        };
    }
  };

  const statusStyle = getStatusStyles(order.status);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEffect((): any => {
    const socket = getSocket();
    socket.on("order-status-update", (data) => {
      if (data.orderId.toString() == order?._id!.toString()) {
        setStatus(data.status);
      }
    });
    return () => socket.off("order-status-update");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] p-7 border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-50 bg-gradient-to-r from-emerald-50/30 to-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-emerald-100 text-emerald-600">
            <Package size={22} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Order{" "}
              <span className="text-emerald-600">
                #{order?._id?.toString()?.slice(-6).toUpperCase()}
              </span>
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              <Calendar size={12} />
              {new Date(order.createdAt!).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status !== "delivered" && (
            <>
              <span
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${
                  order.isPaid
                    ? "bg-emerald-500 text-white border-emerald-400"
                    : "bg-red-50 text-red-600 border-red-100"
                }`}
              >
                {order.isPaid ? "Paid" : "Unpaid"}
              </span>

              <span
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm ${statusStyle.color}`}
              >
                {statusStyle.icon}
                {statusStyle.label}
              </span>
            </>
          )}
        </div>
      </div>

      {status !== "delivered" && (
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="p-2 bg-slate-50 rounded-xl text-emerald-500">
                {order.paymentMethod === "cod" ? (
                  <Truck size={16} />
                ) : (
                  <CreditCard size={16} />
                )}
              </div>
              <span className="text-xs font-bold uppercase tracking-wide">
                {order.paymentMethod === "cod"
                  ? "Cash On Delivery"
                  : "Online Payment"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-600">
              <div className="p-2 bg-slate-50 rounded-xl text-emerald-500">
                <MapPin size={16} />
              </div>
              <span className="text-xs font-medium truncate">
                {order.address.fullAddress}
              </span>
            </div>
          </div>

          {order.assignedDeliveryBoy && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-slate-50">
                        <UserCheck size={28} strokeWidth={1.5} />
                      </div>
                      <span className="absolute bottom-0 right-0 flex h-4 w-4">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Delivery Partner
                      </span>
                      <h4 className="text-lg font-bold leading-tight text-slate-900">
                        {order.assignedDeliveryBoy.name}
                      </h4>
                      <a
                        href={`tel:${order.assignedDeliveryBoy.mobile}`}
                        className="mt-0.5 flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                      >
                        <PhoneOutgoing size={12} />
                        +234 {order.assignedDeliveryBoy.mobile}
                      </a>
                    </div>
                  </div>

                  <a
                    href={`tel:${order.assignedDeliveryBoy.mobile}`}
                    className="group flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 hover:bg-slate-900 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                    aria-label="Call driver"
                  >
                    <Phone
                      size={18}
                      className="transition-transform group-hover:rotate-12"
                    />
                  </a>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50/50 px-3 py-2.5 border border-blue-100/50">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Info size={12} />
                  </div>
                  <p className="text-xs font-medium text-slate-600">
                    Your rider is currently on route to your location.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(`/user/track-order/${order._id?.toString()}`)
                }
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
              >
                <Truck size={18} /> Track Your Order
              </button>
            </div>
          )}

        </div>
      )}
          <div className="bg-slate-50/50 rounded-3xl p-2 border border-slate-100">
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="w-full flex justify-between items-center px-4 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-emerald-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                {expanded ? "Hide Details" : `View ${order.items.length} Items`}
              </span>
              <div
                className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              >
                <ChevronDown size={16} />
              </div>
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-2 space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-white rounded-2xl p-3 border border-slate-100 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {item.name}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          ₦
                          {(
                            Number(item.price) * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                Total Amount
              </p>
              <p className="text-2xl font-black text-emerald-600 tracking-tighter">
                ₦{order.totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Status
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <div
                  className={`w-2 h-2 rounded-full bg-amber-400 animate-pulse`}
                />
                {status.toUpperCase()}
              </div>
            </div>
          </div>
    </motion.div>
  );
};

export default UserOrderCard;
