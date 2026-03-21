/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Hero from "./Hero";
import CategorySlide from "./CategorySlide";
import FoodItemCard from "./FoodItemCard";
import connectDb from "@/lib/db";
import Food, { IFood } from "@/models/food.model";
import Footer from "./Footer";

const UserDashboard = async ({foodList}: {foodList: IFood[]}) => {
  await connectDb();
  // const food = await Food.find({});
  const plainFood = JSON.parse(JSON.stringify(foodList));

 
  return (
    <div>
      <Hero />
      <CategorySlide />
      <div className="w-[90%] md:w-[80%] mx-auto mt-10">
        <h2 className="text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center">
          Popular Food Items
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {plainFood.map((item: any, index: number) => (
            <FoodItemCard key={index} item={item} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default UserDashboard