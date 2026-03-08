"use client";
import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Bike, UtensilsCrossed } from "lucide-react";

type propType = {
  nextStep: (s: number) => void;
};

const Welcome = ({ nextStep }: propType) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-linear-to-b from-green-100 to-white">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex items-center gap-3"
      >
        <UtensilsCrossed className="w-10 h-10 text-orange-600" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-orange-700">
          Item7 Go
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mt-4 text-gray-700 text-lg md:text-xl max-w-lg"
      >
        Order your favorite meals from nearby restaurants and get them delivered
        fast, hot, and hassle-free — right to your doorstep.
      </motion.p>

      {/* Icons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex items-center justify-center gap-10 mt-10"
      >
        <UtensilsCrossed className="w-24 h-24 md:w-32 md:h-32 text-orange-600 drop-shadow-md" />
        <Bike className="w-24 h-24 md:w-32 md:h-32 text-green-600 drop-shadow-md" />
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-2xl shadow-md transition-all duration-200 mt-10"
        onClick={() => nextStep(2)}
      >
        Get Started
        <ArrowRight />
      </motion.button>
    </div>
  );
};

export default Welcome;
