"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  Percent,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCartIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { getSocket } from "@/lib/socket";

const slides = [
  {
    id: 1,
    icon: (
      <ShoppingCartIcon className="w-16 h-16 sm:w-20 sm:h-20 text-orange-500" />
    ),
    title: "Fast Food, Faster Delivery 🚀",
    subtitle:
      "Order hot Nigerian meals on Item7 Go and get them delivered fresh to your doorstep.",
    btnText: "Order Now",
    bg: "https://images.unsplash.com/photo-1692884983087-1d5f7e0b7f8c?q=80&w=1740&auto=format&fit=crop",
  },
  {
    id: 2,
    icon: <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-purple-400" />,
    title: "Always On Time ⏱️",
    subtitle:
      "From street food to gourmet feasts, we ensure your cravings never have to wait.",
    btnText: "Explore Restaurants",
    bg: "https://images.unsplash.com/photo-1629385701021-c8c4b8b3c1b3?q=80&w=1740&auto=format&fit=crop",
  },
  {
    id: 3,
    icon: <Percent className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500" />,
    title: "Best Deals Near You 💸",
    subtitle:
      "Enjoy your favorite Nigerian dishes with exclusive Item7 Go discounts and offers.",
    btnText: "View Deals",
    bg: "https://images.unsplash.com/photo-1682686581427-7c80ab60e3f3?q=80&w=1740&auto=format&fit=crop",
  },
  {
    id: 4,
    icon: (
      <ShieldCheck className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-400" />
    ),
    title: "Clean, Safe & Reliable 🛡️",
    subtitle:
      "Hygienic packaging and vetted local vendors—safety you can taste in every bite.",
    btnText: "Why Item7 Go?",
    bg: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=1740&auto=format&fit=crop",
  },
];

const Hero = () => {
  // const { userData } = useSelector((state: RootState) => state.user);
  // useEffect(() => {
  //   if (userData) {
  //     // eslint-disable-next-line prefer-const
  //     let socket = getSocket();
  //     socket.emit("identity", userData?._id);
  //   }
  // }, [userData]);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full max-w-[1400px] mx-auto mt-28 px-4">
      <div className="relative h-[75vh] sm:h-[80vh] rounded-[2rem] overflow-hidden shadow-2xl bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${current}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slides[current].bg}
              fill
              alt="Food delivery"
              priority
              className="object-cover transition-transform duration-[5000ms] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 backdrop-blur-[1px]" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10 px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="flex flex-col items-center justify-center gap-6 max-w-4xl"
            >
              <div className="bg-white/10 backdrop-blur-xl p-5 sm:p-7 rounded-3xl border border-white/20 shadow-2xl">
                {slides[current].icon}
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1]">
                  {slides[current].title}
                </h1>
                <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed">
                  {slides[current].subtitle}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#f0fdf4" }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 bg-white text-emerald-800 px-10 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3 transition-colors text-lg"
              >
                <ShoppingBasket className="w-6 h-6" />
                {slides[current].btnText}
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className="group relative h-2 transition-all duration-300 focus:outline-none"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  index === current
                    ? "w-12 bg-emerald-400"
                    : "w-3 bg-white/40 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="absolute top-8 left-8 hidden lg:block z-20">
          <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white text-xs font-bold tracking-widest uppercase">
              Verified Kitchens
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
