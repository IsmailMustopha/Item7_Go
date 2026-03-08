import mongoose from "mongoose";

export interface IFood {
  _id?: mongoose.Types.ObjectId;
  name: string;
  category: string;
  price: string;
  image: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const foodSchema = new mongoose.Schema<IFood>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Swallow & Soups 🍲",
        "Rice Dishes 🍚",
        "Jollof & Fried Rice 🔥",
        "Native Nigerian Dishes 🥘",
        "Grills & Suya 🍗",
        "Small Chops 🍢",
        "Pepper Soup 🌶️",
        "Seafood 🐟",
        "Fast Food & Combos 🍔",
        "Breakfast 🍳",
        "Drinks 🥤",
        "Desserts 🍰",
      ],
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Food = mongoose.models.Food || mongoose.model("Food", foodSchema);

export default Food;
