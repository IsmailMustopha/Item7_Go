"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  User,
  Phone,
  Truck,
  ChevronUp,
  ChevronDown,
  CreditCard,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
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

const AdminOrderCard = ({ order }: { order: IOrder }) => {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState<string>("pending");

  const statusOptions = ["pending", "out of delivery", "delivered"];

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      setUpdating(true);
      const result = await axios.post(
        `/api/admin/update-order-status/${orderId}`,
        { status },
      );
      setStatus(status);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    setStatus(order.status);
  }, [order]);

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
      className="bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600">
              <Package size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Order #{order._id?.toString().slice(-6).toUpperCase()}
                </h3>
                {status !== "delivered" && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                      order.isPaid
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-red-50 text-red-600 border-red-100"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs font-medium flex items-center gap-1.5 mt-1">
                <Calendar size={12} />
                {new Date(order.createdAt!).toLocaleString("en-NG", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

            {status !== "delivered" && (
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <div className="pl-2 pr-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Update Status
              </p>
            </div>
              <select
                disabled={updating}
                value={status}
                onChange={(e) =>
                  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                  handleStatusUpdate(order._id?.toString()!, e.target.value)
                }
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer disabled:opacity-50"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st.toUpperCase()}
                  </option>
                ))}
              </select>
          </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Customer
            </p>
            <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <User size={14} className="text-emerald-500" />
              {order.address.fullName}
            </p>
            <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Phone size={14} className="text-emerald-500" />
              {order.address.mobile}
            </p>
          </div>

          <div className="md:col-span-2 space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Delivery Address
            </p>
            <p className="flex items-start gap-2 text-sm font-medium text-slate-600 italic leading-relaxed">
              <MapPin size={14} className="text-emerald-500 mt-1 shrink-0" />
              {order.address.fullAddress}, {order.address.city},{" "}
              {order.address.state}
            </p>
          </div>
        </div>

        {order.assignedDeliveryBoy && (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar with Status Ring */}
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-2 ring-white shadow-sm">
                    <UserCheck size={28} strokeWidth={1.5} />
                  </div>
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
                    Assigned To
                  </span>
                  <h4 className="text-lg font-bold leading-tight text-slate-900">
                    {order.assignedDeliveryBoy.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                    <span className="opacity-60 text-xs">PH:</span>
                    <a
                      href={`tel:${order.assignedDeliveryBoy.mobile}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      +234 {order.assignedDeliveryBoy.mobile}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <a
                href={`tel:${order.assignedDeliveryBoy.mobile}`}
                className="group flex h-12 w-12 items-center justify-center rounded-full hover:bg-slate-900 text-white transition-all bg-blue-600 hover:shadow-lg hover:shadow-blue-200 active:scale-90"
                aria-label="Call driver"
              >
                <Phone
                  size={20}
                  className="transition-transform group-hover:rotate-12"
                />
              </a>
            </div>

            {/* Quick Info Tag */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
              <p className="text-xs font-medium text-slate-600">
                Your rider is handling your order with care.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex justify-between items-center py-4 px-2 hover:bg-slate-50 rounded-xl transition-colors group"
          >
            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Items List ({order.items.length})
            </span>
            <div
              className={`p-1 rounded-lg border border-slate-200 transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              <ChevronDown size={16} className="text-slate-400" />
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
                <div className="space-y-3 pt-2 pb-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
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
                          <p className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">
                          ₦
                          {(
                            Number(item.price) * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <CreditCard size={14} className="text-emerald-500" />
              {order.paymentMethod === "cod"
                ? "Cash On Delivery"
                : "Online Payment"}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Truck size={14} className="text-emerald-500" />
              Status: <span className="text-emerald-600">{status}</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Total Amount
            </p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">
              ₦{order.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminOrderCard;
