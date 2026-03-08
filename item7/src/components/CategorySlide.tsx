"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Utensils,
  Soup,
  Flame,
  Drumstick,
  Fish,
  Coffee,
  Pizza,
  Sandwich,
  IceCream,
  Sunrise,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const CategorySlide = () => {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const categories = [
    { id: 1, name: "Swallow & Soups", icon: Soup, color: "bg-orange-50" },
    { id: 2, name: "Rice Dishes", icon: Utensils, color: "bg-yellow-50" },
    { id: 3, name: "Jollof & Specials", icon: Flame, color: "bg-red-50" },
    { id: 4, name: "Grills & Suya", icon: Drumstick, color: "bg-amber-50" },
    { id: 5, name: "Seafood", icon: Fish, color: "bg-blue-50" },
    { id: 6, name: "Fast Food & Combos", icon: Pizza, color: "bg-pink-50" },
    { id: 7, name: "Small Chops", icon: Sandwich, color: "bg-purple-50" },
    { id: 8, name: "Breakfast", icon: Sunrise, color: "bg-lime-50" },
    { id: 9, name: "Desserts", icon: IceCream, color: "bg-rose-50" },
    { id: 10, name: "Drinks & Beverages", icon: Coffee, color: "bg-teal-50" },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  // Auto-scroll logic with pause-on-hover
  useEffect(() => {
    if (isHovered) return;

    const autoScroll = setInterval(() => {
      if (!scrollRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(autoScroll);
  }, [isHovered]);

  useEffect(() => {
    const currentRef = scrollRef.current;
    currentRef?.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => currentRef?.removeEventListener("scroll", checkScroll);
  }, []);

  return (
    <motion.section
      className="w-full max-w-7xl mx-auto mt-16 px-4 relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col items-center mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Shop by <span className="text-emerald-600">Category</span>
        </h2>
        <div className="h-1.5 w-20 bg-emerald-500 rounded-full mt-2" />
      </div>

      {showLeft && (
        <button
          className="absolute left-2 top-[60%] -translate-y-1/2 z-20 bg-white/90 shadow-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-2xl w-12 h-12 flex items-center justify-center transition-all backdrop-blur-md"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <div
        className="flex gap-5 overflow-x-auto px-2 pb-6 scrollbar-hide scroll-smooth"
        ref={scrollRef}
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`min-w-[140px] md:min-w-[170px] flex flex-col items-center justify-center rounded-[2rem] ${cat.color} border border-transparent hover:border-emerald-200 hover:bg-white shadow-sm hover:shadow-emerald-200/50 transition-all cursor-pointer group/card py-8 px-4`}
          >
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover/card:bg-emerald-600 transition-colors">
              <cat.icon className="w-8 h-8 text-emerald-600 group-hover/card:text-white transition-colors" />
            </div>
            <p className="text-center text-sm md:text-base font-bold text-gray-800 tracking-tight">
              {cat.name}
            </p>
          </motion.div>
        ))}
      </div>

      {showRight && (
        <button
          className="absolute right-2 top-[60%] -translate-y-1/2 z-20 bg-white/90 shadow-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-2xl w-12 h-12 flex items-center justify-center transition-all backdrop-blur-md"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </motion.section>
  );
};

export default CategorySlide;
