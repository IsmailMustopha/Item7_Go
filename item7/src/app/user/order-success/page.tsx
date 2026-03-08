"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

const OrderSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#F9FAFB] overflow-hidden">
      <div className="relative flex flex-col items-center max-w-2xl w-full bg-white p-10 md:p-20 rounded-[3rem] shadow-xl shadow-emerald-900/5 border border-emerald-50 my-5">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-400/20 blur-[80px] rounded-full" />

        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="bg-emerald-100 p-6 rounded-full"
          >
            <CheckCircle
              className="text-emerald-600 w-20 h-20 md:w-24 md:h-24"
              strokeWidth={2.5}
            />
          </motion.div>

          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-emerald-400 rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: (i - 2) * 40,
                y: i % 2 === 0 ? -60 : -40,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Order Placed <br />
            <span className="text-emerald-600">Successfully!</span>
          </h1>
          <p className="text-gray-500 mt-6 text-base md:text-lg font-medium max-w-sm mx-auto leading-relaxed">
            Your delicious items are being prepared. You can track your meal in
            real-time within the orders section.
          </p>
        </motion.div>

        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mt-10 mb-2"
        >
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
            <Package className="w-12 h-12 text-emerald-500" />
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto">
          <Link href="/user/my-orders" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all"
            >
              Track My Order
              <ArrowRight size={18} />
            </motion.button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold border border-gray-100 shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              Shop More
            </motion.button>
          </Link>
        </div>

        <p className="mt-12 text-xs font-bold text-gray-400 uppercase tracking-widest">
          Need help?{" "}
          <Link href="/support" className="text-emerald-500 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
