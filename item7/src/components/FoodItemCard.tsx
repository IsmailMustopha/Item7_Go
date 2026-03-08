"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { addToCart, decreaseQuantity, increaseQuantity } from "@/redux/cartSlide";

interface IFood {
  _id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const FoodItemCard = ({ item }: { item: IFood }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { cartData } = useSelector((state: RootState) => state.cart);
  const cartitem = cartData.find((i) => i._id.toString() == item._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full"
    >
      <div className="relative w-full aspect-square bg-emerald-50/50 overflow-hidden">
        <Image
          src={item.image}
          fill
          alt={item.name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-emerald-100">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-emerald-600 transition-colors duration-300">
            {item.name}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              Price
            </span>
            <span className="text-emerald-600 font-black text-xl">
              ₦{Number(item.price).toLocaleString()}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="h-10 w-10 flex items-center justify-center bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 transition-all"
            aria-label="Add to cart"
            // onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
          >
            <Plus size={20} strokeWidth={3} />
          </motion.button>
        </div>

        {!cartitem ? (
          <motion.button
            className="mt-4 w-full flex items-center justify-center gap-2 hover:bg-gray-900 bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold transition-all duration-300 shadow-sm"
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
          >
            <ShoppingCart size={16} />
            Add to Cart
          </motion.button>
        ) : (
          <div className="mt-4 w-full flex items-center justify-between bg-gray-100 rounded-xl p-1 shadow-sm">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch(decreaseQuantity(item._id))}
              className="flex items-center justify-center w-10 h-10 bg-white text-emerald-600 rounded-lg shadow-sm hover:bg-emerald-50 transition-colors"
            >
              <Minus size={18} />
            </motion.button>

            <span className="font-bold text-gray-800 text-lg">
              {cartitem.quantity}
            </span>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch(increaseQuantity(item._id))}
              className="flex items-center justify-center w-10 h-10 bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Plus size={18} />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FoodItemCard;
