"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LogOut,
  Package,
  Search,
  ShoppingCartIcon,
  ChevronDown,
  X,
  PlusCircle,
  Boxes,
  ClipboardCheck,
  Menu,
  LayoutDashboard,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

interface IUser {
  _id?: string;
  name: string;
  email: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

const Nav = ({ user }: { user: IUser }) => {
  const [open, setOpen] = useState(false);
  const [searchbarOpen, setSearchbarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("")
  const profileDropDownRef = useRef<HTMLDivElement>(null);
  const router = useRouter()

  const { cartData } = useSelector((state: RootState) => state.cart);
  // console.log(cartData.length);
  

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropDownRef.current &&
        !profileDropDownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = search.trim();
    if (!query) {
      return router.push("/");
    }

    router.push(`/?q=${encodeURIComponent(query)}`);
    setSearch("");
    setSearchbarOpen(false)
  };

  // Updated Sidebar Content to include Manage Orders
  const sideBarContent = (
    <AnimatePresence>
      {menuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99900]"
          />

          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed top-0 left-0 h-full w-[280px] sm:w-[320px] z-[9999] bg-gradient-to-b from-emerald-900 via-green-800 to-emerald-950 shadow-2xl  z-[1000000000000000000000000000] flex flex-col border-r border-white/10"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={20} />
                <h1 className="font-bold text-xl tracking-tight">Admin Go</h1>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {[
                { label: "Add Food", icon: PlusCircle, href: "/admin/add" },
                { label: "View Inventory", icon: Boxes, href: "/admin/view" },
                {
                  label: "Manage Orders",
                  icon: ClipboardCheck,
                  href: "/admin/manage-orders",
                },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <link.icon size={20} />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-6 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-3 text-white">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-emerald-500/50">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="user"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-emerald-700 font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <header className="fixed top-0 left-0 w-full z-50 z-[10000]">
      <div className="mx-auto max-w-8xl px-4 pt-4">
        <div className="flex h-16 items-center justify-between rounded-2xl border border-white/20 bg-white/80 px-4 shadow-lg backdrop-blur-md md:px-6">
          <Link href="/" className="group flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
              <Package size={18} />
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
              Item7<span className="text-emerald-600">Go</span>
            </span>
          </Link>

          {user.role === "user" && (
            <form className="hidden md:flex flex-1 max-w-md mx-8 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2 ring-emerald-500 focus-within:ring-1">
              <Search
                onClick={handleSearch}
                className="h-4 w-4 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search delicious food..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </form>
          )}

          <div className="flex items-center gap-3">
            {user.role === "admin" && (
              <div className="hidden lg:flex items-center gap-2 mr-2">
                <Link
                  href="/admin/add"
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all text-sm"
                >
                  <PlusCircle size={16} /> Add
                </Link>
                <Link
                  href="/admin/view"
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all text-sm"
                >
                  <Boxes size={16} /> View
                </Link>
                <Link
                  href="/admin/manage-orders"
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-all text-sm"
                >
                  <ClipboardCheck size={16} /> Manage Orders
                </Link>
              </div>
            )}

            {user.role === "user" && (
              <>
                <button
                  onClick={() => setSearchbarOpen(!searchbarOpen)}
                  className={`md:hidden flex h-10 w-10 items-center justify-center rounded-xl border transition-all shadow-sm ${
                    searchbarOpen
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-emerald-600 border-gray-100"
                  }`}
                >
                  {searchbarOpen ? (
                    <X size={20} />
                  ) : (
                    <Search onClick={handleSearch} size={20} />
                  )}
                </button>
                <Link
                  href="/user/cart"
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-600"
                >
                  <ShoppingCartIcon size={20} />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {cartData.length}
                  </span>
                </Link>
              </>
            )}

            <AnimatePresence>
              {searchbarOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-24 left-0 w-full px-4 md:hidden z-50"
                >
                  <div className="flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-emerald-100 p-3 ring-4 ring-emerald-500/5">
                    <Search className="text-emerald-500 w-5 h-5 ml-1" />
                    <form className="flex-1" onSubmit={handleSearch}>
                      <input
                        autoFocus
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full outline-none text-gray-700 text-sm bg-transparent"
                        placeholder="Search delicious food..."
                      />
                    </form>
                    <button
                      className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
                      onClick={() => setSearchbarOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {user.role === "admin" && (
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg"
              >
                <Menu size={20} />
              </button>
            )}

            <div className="relative" ref={profileDropDownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-1 pr-2 shadow-sm transition-all hover:bg-gray-50"
              >
                <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-emerald-100">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt="avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl z-50"
                  >
                    <div className="mb-2 flex items-center gap-3 border-b border-gray-50 p-3 bg-gray-50/50 rounded-t-xl">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-emerald-500/20 shadow-sm">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt="avatar"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-emerald-600 font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col truncate text-left">
                        <span className="text-sm font-bold text-gray-800 truncate">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {user.role === "user" && (
                        <Link
                          href="/user/my-orders"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                        >
                          <Package size={18} className="text-emerald-600" />
                          My Orders
                        </Link>
                      )}

                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                      >
                        <LogOut size={18} />
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {mounted && createPortal(sideBarContent, document.body)}
    </header>
  );
};

export default Nav;
