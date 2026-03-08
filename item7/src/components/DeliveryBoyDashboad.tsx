/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import LiveMap from "./LiveMap";
import DeliveryChat from "./DeliveryChat";
import { ArrowRight, BellRing, CheckCircle2, Clock, Hash, Loader, Lock, MapPin, Navigation, Package, ShieldCheck, TrendingUp, Wallet, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Bar, BarChart, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ILocation {
  latitude: number;
  longitude: number;
}

const DeliveryBoyDashboard = ({earning}: {earning: number}) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const { userData } = useSelector((state: RootState) => state.user);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });

  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      const result = await axios.get("/api/delivery/get-assignment");
      setAssignments(result.data);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!userData?._id) return;
    if (!navigator.geolocation) return;

    const watcher = navigator.geolocation.watchPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setDeliveryBoyLocation({
        latitude: lat,
        longitude: lon,
      });
      socket.emit("update-location", {
        userId: userData?._id,
        latitude: lat,
        longitude: lon,
      });
    });

    return () => navigator.geolocation.clearWatch(watcher);
  }, [userData?._id]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEffect((): any => {
    const socket = getSocket();

    socket.on("new-assignment", (deliveryAssignment) => {
      setAssignments((prev) => [...prev, deliveryAssignment]);
    });

    return () => socket.off("new-assignment");
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await axios.get(
        `/api/delivery/assignment/${id}/accept-assignment`,
      );
      fetchCurrentOrder()
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCurrentOrder = async () => {
    try {
      const result = await axios.get("/api/delivery/current-order");
      if (result.data.active) {
        setActiveOrder(result.data.assignment);
        setUserLocation({
          latitude: result.data.assignment.order.address.latitude,
          longitude: result.data.assignment.order.address.longitude,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCurrentOrder();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignments();
  }, [userData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useEffect((): any => {
    const socket = getSocket();

    socket.on("update-deliveryBoy-location", ({ userId, location }) => {
      setDeliveryBoyLocation({
        latitude: location.coordinates[1],
        longitude: location.coordinates[0],
      });
    });

    return () => socket.off("update-deliveryBoy-location");
  }, []);

  const sendOtp = async () => {
    setSendOtpLoading(true);
    try {
      const result = await axios.post("/api/delivery/otp/send", {
        orderId: activeOrder.order._id,
      });
      console.log(result.data);
      setShowOtpBox(true);
      setSendOtpLoading(false);
    } catch (error) {
      console.log(error);
      setSendOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setVerifyOtpLoading(true);
    try {
      const result = await axios.post("/api/delivery/otp/verify", {
        orderId: activeOrder.order._id,
        otp,
      });
      console.log(result.data);
      setActiveOrder(null);
      setVerifyOtpLoading(false);

      await fetchCurrentOrder();

      window.location.reload()
    } catch (error) {
      setOtpError("Otp Verification Error");
      setVerifyOtpLoading(false);
    }
  };

  if (!activeOrder && assignments.length === 0) {
    const chartData = [{ name: "Today", earnings: earning }];

    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-20 mt-14 px-6">
        <div className="max-w-md mx-auto space-y-6">
          <header className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">
                Status: Online
              </p>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                Earnings
              </h1>
            </div>
            <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
              <BellRing size={20} />
            </div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Wallet size={16} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Total Balance
                </span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter">
                ₦{earning.toLocaleString()}
              </h2>
              <div className="mt-6 flex items-center gap-2 text-emerald-400">
                <TrendingUp size={16} />
                <span className="text-xs font-bold uppercase tracking-tighter">
                  Daily Target: 80% Achieved
                </span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-10 -mt-10 rounded-full" />
          </motion.div>

          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              Activity Graph
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 700 }}
                  />
                  <Bar
                    dataKey="earnings"
                    radius={[10, 10, 10, 10]}
                    barSize={60}
                  >
                    <Cell fill="#10b981" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col items-center py-10 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
              <div className="relative bg-white p-5 rounded-full border-2 border-emerald-100">
                <Navigation size={32} className="text-emerald-500" />
              </div>
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Waiting for new tasks...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (activeOrder && userLocation) {
    return (
      <div className="p-4 pt-[120px] min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="border-l-4 border-green-600 pl-4 py-2">
            <div className="flex flex-col">
              {/* Title with tighter tracking for a modern feel */}
              <h1 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
                Active Delivery
              </h1>

              {/* Subdued ID with a divider line */}
              <div className="flex items-center gap-2 mt-1">
                <span className="h-[1px] w-4 bg-gray-300"></span>
                <p className="text-gray-400 font-mono text-xs font-medium uppercase tracking-widest">
                  REF: {activeOrder.order._id.slice(-6)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100  mb-6">
            <div className="rounded-2xl overflow-hidden h-64 border border-slate-200 relative">
              <LiveMap
                userLocation={userLocation}
                deliveryBoyLocation={deliveryBoyLocation}
              />
            </div>
          </div>
          <DeliveryChat
            orderId={activeOrder.order._id}
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            deliveryBoyId={userData?._id?.toString()!}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6"
          >
            <AnimatePresence mode="wait">
              {/* STEP 1: INITIAL BUTTON */}
              {!activeOrder.order.deliveryOtpVerification && !showOtpBox && (
                <motion.div
                  key="mark-delivered"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Security Protocol
                    </span>
                  </div>
                  <button
                    onClick={sendOtp}
                    disabled={sendOtpLoading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.15em] shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {sendOtpLoading ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <>
                        Mark as Delivered <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-tighter">
                    Verification OTP will be sent to the customer
                  </p>
                </motion.div>
              )}

              {/* STEP 2: OTP INPUT BOX */}
              {showOtpBox && !activeOrder.order.deliveryOtpVerification && (
                <motion.div
                  key="otp-box"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="text-center space-y-1 mb-6">
                    <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Lock size={20} className="text-blue-600" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      Verify Delivery
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Enter 4-digit code from customer
                    </p>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center text-2xl font-black text-slate-900 tracking-[0.5em] focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder="0000"
                    maxLength={4}
                    onChange={(e) => setOtp(e.target.value)}
                    value={otp}
                  />

                  <button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    onClick={verifyOtp}
                  >
                    {verifyOtpLoading ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      "Confirm Verification"
                    )}
                  </button>

                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-600 p-3 rounded-xl text-[10px] font-bold text-center border border-red-100 uppercase"
                    >
                      {otpError}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* STEP 3: SUCCESS STATE */}
              {activeOrder.order.deliveryOtpVerification && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-3"
                >
                  <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                      Delivery Secured
                    </h3>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]">
                      Transaction Complete
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }


return (
  <div className="w-full min-h-screen bg-[#F8FAFC] p-4 mt-5 pb-20">
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mt-16 mb-8 px-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          New <span className="text-emerald-600">Tasks</span>
        </h2>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
          {assignments.length} Available Assignments
        </p>
      </header>

      <AnimatePresence mode="popLayout">
        {assignments.length > 0 ? (
          assignments.map((a, index) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 mb-5 relative overflow-hidden hover:shadow-xl hover:shadow-emerald-500/5 transition-all"
            >
              {/* Top Bar: Order ID & Distance */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 text-white p-2.5 rounded-2xl">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      <Hash size={10} /> Order Reference
                    </div>
                    <p className="font-black text-slate-900 leading-none">
                      #{a?.order._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-100">
                  <Navigation size={12} className="fill-emerald-700" />
                  <span className="text-[11px] font-black tracking-tighter">
                    {/* 2.4 KM */}
                  </span>
                </div>
              </div>

              {/* Address Visualizer */}
              <div className="flex gap-4 mb-8">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <div className="w-0.5 h-10 bg-dashed border-l-2 border-slate-100" />
                  <MapPin size={16} className="text-slate-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Delivery Destination
                  </h4>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">
                    {a.order.address.fullAddress}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">
                    {a.order.address.city}, {a.order.address.pincode}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => handleAccept(a._id)}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-widest py-4 rounded-2xl shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Accept Task
                </button>

                <button className="flex-1 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 font-black uppercase text-[11px] tracking-widest py-4 rounded-2xl border border-slate-100 transition-all flex items-center justify-center gap-2">
                  <XCircle size={18} /> Reject
                </button>
              </div>

              {/* Decorative Background Element */}
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform">
                <Package size={120} />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 mb-4">
              <Clock size={48} className="text-slate-200 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">
              Scanning for orders...
            </h3>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

};

export default DeliveryBoyDashboard;
