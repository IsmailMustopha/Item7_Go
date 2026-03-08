"use client";
import { IFood } from "@/models/food.model";
import axios from "axios";
import {
  ArrowLeft,
  Loader,
  Package,
  Pencil,
  Search,
  Upload,
  X,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react"; 
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";

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

function ViewFood() {
  const router = useRouter();
  const [foods, setFoods] = useState<IFood[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<IFood | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [backendImage, setBackendImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const getFoods = async () => {
      try {
        const result = await axios.get("/api/admin/get-food");
        setFoods(result.data);
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };
    getFoods();
  }, []);

  // Filter logic
  const filteredFoods = useMemo(() => {
    return foods.filter(
      (food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [foods, searchQuery]);

  useEffect(() => {
    if (editing) {
      setImagePreview(editing.image);
    } else {
      setImagePreview(null);
      setBackendImage(null);
    }
  }, [editing]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackendImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("foodId", editing._id!.toString());
      formData.append("name", editing.name);
      formData.append("category", editing.category);
      formData.append("price", editing.price.toString());
      if (backendImage) {
        formData.append("image", backendImage);
      }

      await axios.post("/api/admin/edit-food", formData);
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !editing ||
      !window.confirm("Are you sure you want to delete this item?")
    )
      return;
    setDeleteLoading(true);
    try {
      await axios.post("/api/admin/delete-food", {
        foodId: editing._id,
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="pt-8 w-[95%] md:w-[85%] max-w-6xl mx-auto pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12"
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-black text-green-700 flex items-center gap-3">
          <Package size={32} />
          Manage Food Inventory
        </h1>
        <div className="w-24 hidden md:block" /> {/* Spacer for balance */}
      </motion.div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative group">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-3xl pl-14 pr-6 py-4 shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all text-gray-700"
            placeholder="Search by food name or category..."
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((g, i) => (
            <motion.div
              key={g._id?.toString() || i}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 hover:shadow-md transition-shadow"
            >
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-inner bg-gray-50">
                <Image
                  src={g.image}
                  alt={g.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-1">
                  {g.category}
                </p>
                <h3 className="font-bold text-xl text-gray-800 mb-2">
                  {g.name}
                </h3>
                <p className="text-2xl font-black text-gray-900">₦{g.price}</p>
              </div>

              <button
                onClick={() => setEditing(g)}
                className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-600 transition-colors"
              >
                <Pencil size={16} /> Edit Item
              </button>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              No food items found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditing(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden relative shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-gray-900">
                    Edit Product
                  </h2>
                  <button
                    onClick={() => setEditing(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Image Preview / Upload */}
                  <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 group">
                    {imagePreview && (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    )}
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                      <Upload size={32} className="mb-2" />
                      <span className="font-bold text-sm">Change Image</span>
                      <input
                        type="file"
                        hidden
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                        Food Name
                      </label>
                      <input
                        type="text"
                        value={editing.name}
                        onChange={(e) =>
                          setEditing({ ...editing, name: e.target.value })
                        }
                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 mt-1 font-bold outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Price (₦)
                        </label>
                        <input
                          type="number"
                          value={editing.price}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              price: e.target.value as any,
                            })
                          }
                          className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 mt-1 font-bold outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                          Category
                        </label>
                        <select
                          value={editing.category}
                          onChange={(e) =>
                            setEditing({ ...editing, category: e.target.value })
                          }
                          className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 mt-1 font-bold outline-none focus:ring-2 focus:ring-green-500 transition-all appearance-none"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={handleEdit}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader className="animate-spin" size={20} />
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      {deleteLoading ? (
                        <Loader className="animate-spin" size={20} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      Delete Product
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewFood;
