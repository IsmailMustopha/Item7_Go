"use client";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBasket,
  Trash2,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Image from "next/image";
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} from "@/redux/cartSlide";
import { useRouter } from "next/navigation";

const CartPage = () => {
  const router = useRouter();
  const { cartData, subTotal, deliveryFee, finalTotal } = useSelector(
    (state: RootState) => state.cart,
  );
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">Continue Shopping</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="h-2 w-8 rounded-full bg-emerald-500" />
            <span className="h-2 w-8 rounded-full bg-gray-200" />
            <span className="h-2 w-8 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            Review Your <span className="text-emerald-600">Order</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Items in your basket are reserved for a limited time.
          </p>
        </header>

        {cartData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBasket className="text-emerald-600 w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Your basket is feeling light
            </h2>
            <Link
              href="/"
              className="mt-4 text-emerald-600 font-bold hover:underline"
            >
              Go add some flavor →
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <AnimatePresence mode="popLayout">
                {cartData.map((item, index: number) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 flex gap-4 sm:gap-6 items-center shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gray-50 shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-emerald-600 font-black text-lg mt-1">
                          ₦
                          {(
                            Number(item.price) * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1">
                          <button
                            onClick={() => dispatch(decreaseQuantity(item._id))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-gray-600"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => dispatch(increaseQuantity(item._id))}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-emerald-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => dispatch(removeFromCart(item._id))}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Payment Summary
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Subtotal</span>
                      <span className="text-gray-900">
                        ₦{subTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-medium">
                      <span>Delivery Service</span>
                      <span className="text-emerald-600 font-bold">
                        + ₦{deliveryFee.toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-6 mt-6 border-t border-dashed border-gray-200">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Total to pay
                          </p>
                          <p className="text-4xl font-black text-gray-900">
                            ₦{finalTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/user/checkout")}
                      className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all mt-4"
                    >
                      Secure Checkout
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                      Secure
                      <br />
                      Payment
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <Truck className="text-emerald-500" size={20} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase leading-tight">
                      Fast
                      <br />
                      Delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
