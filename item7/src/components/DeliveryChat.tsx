/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/message.model";
import axios from "axios";
import { Loader, Send, Sparkle, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  orderId: string;
  deliveryBoyId?: string;
};

function DeliveryChat({ orderId, deliveryBoyId }: Props) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Initial Setup
  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-room", orderId);

    const handleNewMessage = (message: IMessage) => {
      if (message.roomId.toString() === orderId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("send-message", handleNewMessage);

    // Fetch History
    const fetchHistory = async () => {
      const res = await axios.post("/api/chat/message", { roomId: orderId });
      setMessages(res.data);
    };
    fetchHistory();

    return () => {
      socket.off("send-message", handleNewMessage);
    };
  }, [orderId]);

  // Auto-scroll
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
      senderId: deliveryBoyId,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("send-message", message);
    setNewMessage("");
    setSuggestions([]);
  };

  const getSuggestion = async () => {
    setLoading(true);
    try {
      const lastMsg = messages
        .filter((m) => m.senderId.toString() !== deliveryBoyId)
        .at(-1);
      const res = await axios.post("/api/chat/ai-suggestions", {
        message: lastMsg?.text || "Hello, I am your delivery rider.",
        role: "delivery_boy",
      });
      setSuggestions(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
              className={`flex ${msg.senderId?.toString() === deliveryBoyId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 max-w-[85%] rounded-[1.5rem] text-sm font-bold shadow-sm ${
                  msg.senderId?.toString() === deliveryBoyId
                    ? "bg-emerald-600 text-white rounded-tr-none shadow-emerald-50"
                    : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <span
                  className={`text-[8px] mt-1.5 block font-black uppercase opacity-60 ${msg.senderId?.toString() === deliveryBoyId ? "text-right" : "text-left"}`}
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
  );
}

export default DeliveryChat;
