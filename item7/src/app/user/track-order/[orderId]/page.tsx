"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { IUser } from "@/models/user.model";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  ArrowLeft,
  Loader,
  Send,
  Sparkle,
  Phone,
  ChevronDown,
  Package,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import LiveMap from "@/components/LiveMap";
import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/message.model";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";

interface ILocation {
  latitude: number;
  longitude: number;
}

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

function TrackOrder() {
  const { userData } = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const { orderId } = useParams();

  const [order, setOrder] = useState<IOrder>();
  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const statusSteps = ["pending", "out of delivery", "delivered"];
  const currentStep = statusSteps.indexOf(order?.status || "pending");

  // Fetch Order Data
  useEffect(() => {
    const getOrder = async () => {
      try {
        const result = await axios.get(`/api/user/get-order/${orderId}`);
        setOrder(result.data);
        setUserLocation({
          latitude: result.data.address.latitude,
          longitude: result.data.address.longitude,
        });
        if (result.data.assignedDeliveryBoy?.location) {
          setDeliveryBoyLocation({
            latitude: result.data.assignedDeliveryBoy.location.coordinates[1],
            longitude: result.data.assignedDeliveryBoy.location.coordinates[0],
          });
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };
    if (orderId) getOrder();
  }, [orderId, userData?._id]);

  // Socket: Real-time Location and Messaging
  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-room", orderId);

    socket.on("update-deliveryBoy-location", (data) => {
      setDeliveryBoyLocation({
        latitude: data.location.coordinates?.[1] ?? data.location.latitude,
        longitude: data.location.coordinates?.[0] ?? data.location.longitude,
      });
    });

    socket.on("send-message", (message) => {
      if (message.roomId === orderId) {
        setMessages((prev) => [...(prev || []), message]);
      }
    });

    return () => {
      socket.off("update-deliveryBoy-location");
      socket.off("send-message");
    };
  }, [orderId]);

  // Fetch Initial Messages
  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const result = await axios.post("/api/chat/message", {
          roomId: orderId,
        });
        setMessages(result.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    if (orderId) getAllMessages();
  }, [orderId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMsg = () => {
    if (!newMessage.trim()) return;
    const socket = getSocket();
    const message = {
      roomId: orderId,
      text: newMessage,
      senderId: userData?._id,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("send-message", message);
    setNewMessage("");
  };

  const getSuggestion = async () => {
    setLoading(true);
    try {
      const lastMessage = messages
        ?.filter((m) => m.senderId !== userData?._id)
        ?.at(-1);
      const result = await axios.post("/api/chat/ai-suggestions", {
        message: lastMessage?.text || "Where is my order?",
        role: "user",
      });
      setSuggestions(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Enhanced Sticky Header */}
      <header className="sticky top-0 z-[1000] bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Track Order
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {order?.status}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Order #{orderId?.toString().slice(-8)}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-4 pb-12">
        {/* Status Stepper & Map Card */}
        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8 px-2">
            {statusSteps.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-2 z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                      idx <= currentStep
                        ? "bg-green-600 text-white ring-4 ring-green-100"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-tighter ${
                      idx <= currentStep ? "text-green-700" : "text-slate-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 -mt-6 transition-all duration-500 ${
                      idx < currentStep ? "bg-green-600" : "bg-slate-100"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden h-64 border border-slate-200 relative">
            <LiveMap
              userLocation={userLocation}
              deliveryBoyLocation={deliveryBoyLocation}
            />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-2 border border-slate-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              LIVE LOCATION
            </div>
          </div>
        </div>

        {/* Delivery Partner & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {order?.assignedDeliveryBoy && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-3">
              <div className="relative">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-slate-50">
                    <UserCheck size={28} strokeWidth={1.5} />
                  </div>
                  <span className="absolute bottom-0 right-0 flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Delivery Partner
                </p>
                <h3 className="font-bold text-slate-900 leading-none">
                  {order?.assignedDeliveryBoy.name}
                </h3>
              </div>
              <a
                href={`tel:${order?.assignedDeliveryBoy.mobile}`}
                className="p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
              >
                <Phone size={18} />
              </a>
            </div>
          )}

          <div
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer"
            onClick={() => setShowItems(!showItems)}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Package size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Order Summary
                </p>
                <h3 className="font-bold text-slate-900 leading-none">
                  {order?.items.length} Items
                </h3>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform ${showItems ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Expandable Order Items */}
        <AnimatePresence>
          {showItems && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white rounded-2xl border border-slate-100"
            >
              <div className="p-4 space-y-3">
                {order?.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-slate-600">
                      <span className="font-bold text-slate-900">
                        {item.quantity}x
                      </span>{" "}
                      {item.name}
                    </span>
                    <span className="font-medium text-slate-900">
                      ₦{item.price}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t flex justify-between font-bold text-slate-900">
                  <span>Total Paid</span>
                  <span>₦{order?.totalAmount}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

         <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col h-[520px] overflow-hidden">
      {/* Sub-Header */}
      <div className="px-6 py-5 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500 p-1.5 rounded-lg shadow-lg shadow-emerald-100">
            <MessageSquare size={14} className="text-white" />
          </div>
          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
            Customer Chat
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={getSuggestion}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all hover:bg-indigo-700"
        >
          {loading ? (
            <Loader size={12} className="animate-spin" />
          ) : (
            <Sparkle size={12} />
          )}
          AI Assist
        </motion.button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
        ref={chatBoxRef}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.senderId === userData?._id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 max-w-[85%] rounded-[1.5rem] text-sm font-bold shadow-sm ${
                  msg.senderId === userData?._id
                    ? "bg-emerald-600 text-white rounded-tr-none shadow-emerald-50"
                    : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <span
                  className={`text-[8px] mt-1.5 block font-black uppercase opacity-60 ${msg.senderId === userData?._id ? "text-right" : "text-left"}`}
                >
                  {msg.time}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-50 bg-white">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => setNewMessage(s)}
            className="whitespace-nowrap px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black transition-all border border-emerald-100 shrink-0 uppercase tracking-tighter"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-5 bg-white">
        <div className="flex items-center gap-2 bg-slate-50 rounded-[1.8rem] p-1.5 border border-slate-100 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
          <input
            type="text"
            placeholder="Text customer..."
            className="flex-1 bg-transparent px-4 py-3 text-xs font-bold outline-none placeholder:text-slate-400"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          />
          <button
            onClick={sendMsg}
            disabled={!newMessage.trim()}
            className="p-3.5 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-100 hover:scale-105 active:scale-95 disabled:bg-slate-200 disabled:shadow-none transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
      </main>
    </div>
  );
}

export default TrackOrder;

