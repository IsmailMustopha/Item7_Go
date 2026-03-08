"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Bike, User, UserCog } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const EditRoleMobile = () => {
  const [roles, setRoles] = useState([
    { id: "admin", label: "Admin", icon: UserCog },
    { id: "user", label: "User", icon: User },
    { id: "deliveryBoy", label: "Delivery Boy", icon: Bike },
  ]);
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("");
  const [mobile, setMobile] = useState("");
  const { update } = useSession();
  const handleEdit = async () => {
    try {
      const result = await axios.post("/api/user/edit-role-mobile", {
        role: selectedRole,
        mobile,
      });
      console.log(result);
      await update({ role: selectedRole });
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkForAdmin = async () => {
      try {
        const result = await axios.get("/api/check-for-admin");
        if (result.data.adminExist) {
          setRoles((prev) => prev.filter((r) => r.id !== "admin"));
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkForAdmin();
  }, []);

  return (
    <div className="min-h-screen mt-5 w-full flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200 p-6 md:p-10"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-4xl font-extrabold text-center text-gray-800"
        >
          Choose Your Role
        </motion.h1>
        <p className="text-center text-gray-500 mt-2">
          Select how you want to use the platform
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-10">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <motion.div
                key={role.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setSelectedRole(role.id)}
                className={`relative cursor-pointer rounded-2xl border transition-all p-6 flex flex-col items-center text-center ${
                  isSelected
                    ? "border-green-600 bg-green-50 shadow-lg"
                    : "border-gray-200 bg-white hover:shadow-md"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-14 h-14 rounded-xl mb-4 ${
                    isSelected
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon size={28} />
                </div>
                <span
                  className={`font-semibold text-lg ${
                    isSelected ? "text-green-700" : "text-gray-700"
                  }`}
                >
                  {role.label}
                </span>

                {isSelected && (
                  <span className="absolute top-3 right-3 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                    Selected
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <label
            htmlFor="mobile"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Mobile Number
          </label>
          <input
            type="tel"
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="e.g. 08012345678"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          />
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          disabled={mobile.length < 10 || !selectedRole}
          onClick={handleEdit}
          className={`mt-12 w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-lg transition-all ${
            selectedRole && mobile.length > 10
              ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Continue
          <ArrowRight />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default EditRoleMobile;
