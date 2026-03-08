"use client";
import Link from "next/link";
import React, { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Changed to framer-motion for compatibility
import {
  ArrowLeft,
  Loader,
  PlusCircle,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";

const Add = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [backendImage, setBackendImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const categories = [
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
  ];

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    setBackendImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !category || !price || !backendImage) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    try {
      setLoading(true);
      setStatus("idle");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("image", backendImage);

      const result = await axios.post("/api/admin/add-food", formData);

      if (result.status === 200 || result.status === 201) {
        setStatus("success");
        // Reset Form
        setName("");
        setCategory("");
        setPrice("");
        setPreview(null);
        setBackendImage(null);
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setLoading(false);
      // Reset status after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 py-16 px-4 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-emerald-700 font-semibold bg-white px-4 py-2 rounded-2xl shadow-sm border border-emerald-100 hover:bg-emerald-50 transition-all z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden md:block">Dashboard</span>
      </Link>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-2xl shadow-xl rounded-[2.5rem] border border-emerald-50 p-8 md:p-12"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="bg-emerald-100 p-4 rounded-3xl mb-4">
            <PlusCircle className="text-emerald-600 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Add Food Item
          </h1>
          <p className="text-gray-500 text-sm mt-2 text-center max-w-xs">
            Expand the Item7 Go menu by adding fresh Nigerian delicacies.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Food Name
            </label>
            <input
              required
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="eg: Smoky Party Jollof Rice"
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Category
              </label>
              <select
                required
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 appearance-none cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option value={cat} key={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Price (₦)
              </label>
              <input
                required
                onChange={(e) => setPrice(e.target.value)}
                value={price}
                type="number"
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Product Image
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed border-emerald-100 rounded-[2rem] bg-emerald-50/30 transition-hover hover:bg-emerald-50/50">
              <label
                htmlFor="image"
                className="cursor-pointer flex flex-col items-center justify-center gap-2 bg-white text-emerald-700 font-bold border border-emerald-200 rounded-2xl px-8 py-4 hover:shadow-md transition-all w-full sm:w-auto text-sm"
              >
                <Upload className="w-5 h-5" /> Choose Image
              </label>

              <input
                type="file"
                id="image"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />

              {preview ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white">
                  <Image
                    src={preview}
                    fill
                    alt="preview"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="text-emerald-400 text-xs font-medium italic">
                  No image selected
                </div>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            className={`mt-4 w-full font-bold py-5 rounded-[1.5rem] shadow-lg transition-all flex items-center justify-center gap-3 text-lg ${
              status === "success"
                ? "bg-emerald-500 text-white"
                : status === "error"
                  ? "bg-red-500 text-white"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {loading ? (
              <Loader className="w-6 h-6 animate-spin" />
            ) : status === "success" ? (
              <>
                <CheckCircle className="w-6 h-6" /> Item Added!
              </>
            ) : status === "error" ? (
              <>
                <XCircle className="w-6 h-6" /> Upload Failed
              </>
            ) : (
              "Publish Food Item"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Add;
