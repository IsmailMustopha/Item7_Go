"use client";
import { RootState } from "@/redux/store";
import {
  ArrowLeft,
  CreditCardIcon,
  Home,
  LocateFixed,
  MapPin,
  Phone,
  Search,
  Truck,
  User,
  ShieldCheck,
  Building,
  Navigation,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import dynamic from "next/dynamic";

const CkeckoutMap = dynamic(() => import("@/components/CkeckoutMap"), {ssr: false});



const Checkout = () => {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.user);
  const { subTotal, deliveryFee, finalTotal, cartData } = useSelector(
    (state: RootState) => state.cart,
  );

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    fullAddress: "",
  });

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => console.log("location error", err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
      );
    }
  }, []);

  useEffect(() => {
    if (userData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAddress((prev) => ({
        ...prev,
        fullName: userData?.name || "",
        mobile: userData?.mobile || "",
      }));
    }
  }, [userData]);

  const handleCod = async () => {

    if (!position) {
      return null
    }

    try {
      const result = await axios.post("/api/user/order", {
        userId: userData?._id,
        items: cartData.map((item) => ({
          foodId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalAmount: finalTotal,
        address: {
          fullName: address.fullName,
          mobile: address.mobile,
          city: address.city,
          state: address.state,
          fullAddress: address.fullAddress,
          pincode: address.pincode,
          latitude: position[0],
          longitude: position[1],
        },
        paymentMethod,
      });

      console.log(result.data);
      router.push('/user/order-success')
    } catch (error) {
      console.log(error);
      
    }
  };

  const handleOnlinePayment = async () => {
    try {
      const { data } = await axios.post("/api/user/payment", {
        userId: userData?._id,
        items: cartData,
        totalAmount: finalTotal,
        address: address, 
        paymentMethod: "online",
      });

      if (data.url) {
        window.location.href = data.url; 
      }
    } catch (error) {
      console.error("Payment trigger failed", error);
    }
  };

  const handleSearchQuery = async () => {
    const { OpenStreetMapProvider } = await import("leaflet-geosearch");
    setSearchLoading(true);
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: searchQuery });
    if (results.length > 0) {
      setPosition([results[0].y, results[0].x]);
    }
    setSearchLoading(false);
  };

  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      try {
        const result = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`,
        );
        const addr = result.data.address;
        setAddress((prev) => ({
          ...prev,
          city: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
          fullAddress: result.data.display_name,
        }));
      } catch (error) {
        console.log(error);
      }
    };
    fetchAddress();
  }, [position]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-[1000]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/user/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">Review Cart</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="h-2 w-8 rounded-full bg-emerald-500" />
            <span className="h-2 w-8 rounded-full bg-emerald-500" />
            <span className="h-2 w-8 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-10">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
            Checkout <span className="text-emerald-600">Details</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Please confirm your delivery location and payment.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                  <MapPin size={26} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Shipping Address
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={address.fullName}
                      onChange={(e) =>
                        setAddress({ ...address, fullName: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                  <div className="relative group">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={address.mobile}
                      onChange={(e) =>
                        setAddress({ ...address, mobile: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <Home
                    className="absolute left-4 top-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                    size={18}
                  />
                  <textarea
                    rows={2}
                    placeholder="Full Street Address / Landmark"
                    value={address.fullAddress}
                    onChange={(e) =>
                      setAddress({ ...address, fullAddress: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative group">
                    <Building
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-sm"
                    />
                  </div>
                  <div className="relative group">
                    <Navigation
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={address.state}
                      onChange={(e) =>
                        setAddress({ ...address, state: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-sm"
                    />
                  </div>
                  <div className="relative group">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={address.pincode}
                      onChange={(e) =>
                        setAddress({ ...address, pincode: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search specific area..."
                      className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm shadow-sm"
                    />
                    <button
                      onClick={handleSearchQuery}
                      className="bg-gray-900 text-white px-8 rounded-2xl font-bold hover:bg-emerald-600 transition-all"
                    >
                      Locate
                    </button>
                  </div>
                  <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden border border-gray-100 z-0 shadow-inner">
                    {position && (
                     <CkeckoutMap position={position} setPosition={setPosition}/>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        navigator.geolocation.getCurrentPosition((p) =>
                          setPosition([p.coords.latitude, p.coords.longitude]),
                        )
                      }
                      className="absolute bottom-6 right-6 bg-white text-emerald-600 p-4 rounded-2xl shadow-2xl z-[500] hover:bg-emerald-50 transition-colors border border-emerald-50"
                    >
                      <LocateFixed size={24} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Select Payment
                </h2>

                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => setPaymentMethod("online")}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === "online"
                        ? "border-emerald-600 bg-emerald-50/50"
                        : "border-gray-50 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${paymentMethod === "online" ? "bg-emerald-600 text-white" : "bg-white text-gray-400"}`}
                      >
                        <CreditCardIcon size={20} />
                      </div>
                      <span
                        className={`font-bold text-sm ${paymentMethod === "online" ? "text-emerald-950" : "text-gray-500"}`}
                      >
                        Pay Online
                      </span>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "online" ? "border-emerald-600" : "border-gray-300"}`}
                    >
                      {paymentMethod === "online" && (
                        <div className="h-2.5 w-2.5 bg-emerald-600 rounded-full" />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === "cod"
                        ? "border-emerald-600 bg-emerald-50/50"
                        : "border-gray-50 bg-gray-50 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${paymentMethod === "cod" ? "bg-emerald-600 text-white" : "bg-white text-gray-400"}`}
                      >
                        <Truck size={20} />
                      </div>
                      <span
                        className={`font-bold text-sm ${paymentMethod === "cod" ? "text-emerald-950" : "text-gray-500"}`}
                      >
                        Cash on Delivery
                      </span>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-emerald-600" : "border-gray-300"}`}
                    >
                      {paymentMethod === "cod" && (
                        <div className="h-2.5 w-2.5 bg-emerald-600 rounded-full" />
                      )}
                    </div>
                  </button>
                </div>

                <div className="space-y-4 pt-6 border-t border-dashed border-gray-200">
                  <div className="flex justify-between text-gray-500 font-medium text-sm">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-bold">
                      ₦{subTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium text-sm">
                    <span>Delivery Fee</span>
                    <span className="text-emerald-600 font-bold">
                      ₦{deliveryFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Final Total
                    </p>
                    <p className="text-4xl font-black text-gray-900 leading-tight">
                      ₦{finalTotal.toLocaleString()}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    
                     onClick={() => {
                      if (paymentMethod == "cod") {
                        handleCod();
                      } else {
                        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                        handleOnlinePayment()
                      }
                    }}
                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all mt-4"
                  >
                    {paymentMethod === "cod"
                      ? "Place Order"
                      : "Proceed to Payment"}
                  </motion.button>
                </div>
              </motion.div>

              <div className="bg-emerald-900 p-6 rounded-[2rem] text-white flex items-center gap-4">
                <ShieldCheck size={28} className="opacity-50" />
                <p className="text-xs font-medium opacity-80 leading-relaxed">
                  Secure SSL Checkout. Your data and payment details are fully
                  encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

// "use client";
// import "leaflet/dist/leaflet.css";
// import { RootState } from "@/redux/store";
// import L, { LatLngExpression } from "leaflet";
// import {
//   ArrowLeft,
//   CreditCardIcon,
//   Home,
//   LocateFixed,
//   MapPin,
//   Phone,
//   Search,
//   Truck,
//   User,
//   ShieldCheck,
// } from "lucide-react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import { OpenStreetMapProvider } from "leaflet-geosearch";

// const markerIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
//   iconSize: [40, 40],
//   iconAnchor: [20, 40],
// });

// const Checkout = () => {
//   const router = useRouter();
//   const { userData } = useSelector((state: RootState) => state.user);
//   const { subTotal, deliveryFee, finalTotal, cartData } = useSelector(
//     (state: RootState) => state.cart,
//   );

//   const [address, setAddress] = useState({
//     fullName: "",
//     mobile: "",
//     city: "",
//     state: "",
//     pincode: "",
//     fullAddress: "",
//   });

//   const [position, setPosition] = useState<[number, number] | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");

//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const { latitude, longitude } = pos.coords;
//           setPosition([latitude, longitude]);
//         },
//         (err) => console.log("location error", err),
//         { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
//       );
//     }
//   }, []);

//   useEffect(() => {
//     if (userData) {
//       setAddress((prev) => ({
//         ...prev,
//         fullName: userData?.name || "",
//         mobile: userData?.mobile || "",
//       }));
//     }
//   }, [userData]);

//   const DraggableMarker: React.FC = () => {
//     const map = useMap();
//     useEffect(() => {
//       if (position)
//         map.setView(position as LatLngExpression, 15, { animate: true });
//     }, [position, map]);

//     return (
//       <Marker
//         icon={markerIcon}
//         position={position as LatLngExpression}
//         draggable={true}
//         eventHandlers={{
//           dragend: (e: L.LeafletEvent) => {
//             const marker = e.target as L.Marker;
//             const { lat, lng } = marker.getLatLng();
//             setPosition([lat, lng]);
//           },
//         }}
//       />
//     );
//   };

//   const handleCod = async () => {

//     if (!position) {
//       return null
//     }

//     try {
//       const result = await axios.post("/api/user/order", {
//         userId: userData?._id,
//         items: cartData.map((item) => ({
//           food: item._id,
//           name: item.name,
//           price: item.price,
//           quantity: item.quantity,
//           image: item.image,
//         })),
//         totalAmount: finalTotal,
//         address: {
//           fullName: address.fullName,
//           mobile: address.mobile,
//           city: address.city,
//           state: address.state,
//           fullAddress: address.fullAddress,
//           pincode: address.pincode,
//           latitude: position[0],
//           longitude: position[1],
//         },
//         paymentMethod,
//       });

//       console.log(result.data);
//       router.push('/user/order-sucess')
//     } catch (error) {
//       console.log(error);
      
//     }
//   };

//   const handleSearchQuery = async () => {
//     setSearchLoading(true);
//     const provider = new OpenStreetMapProvider();
//     const results = await provider.search({ query: searchQuery });
//     if (results.length > 0) {
//       setPosition([results[0].y, results[0].x]);
//     }
//     setSearchLoading(false);
//   };

//   useEffect(() => {
//     const fetchAddress = async () => {
//       if (!position) return;
//       try {
//         const result = await axios.get(
//           `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`,
//         );
//         const addr = result.data.address;
//         setAddress((prev) => ({
//           ...prev,
//           city: addr.city || addr.town || addr.village || "",
//           state: addr.state || "",
//           pincode: addr.postcode || "",
//           fullAddress: result.data.display_name,
//         }));
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     fetchAddress();
//   }, [position]);

//   return (
//     <div className="min-h-screen bg-[#F9FAFB] pb-20">
//       <div className="bg-white border-b border-gray-100 sticky top-0 z-[1000]">
//         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
//           <button
//             onClick={() => router.push("/user/cart")}
//             className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
//           >
//             <ArrowLeft size={20} />
//             <span className="font-semibold text-sm">Return to Cart</span>
//           </button>
//           <div className="flex items-center gap-2">
//             <span className="h-2 w-8 rounded-full bg-emerald-500" />
//             <span className="h-2 w-8 rounded-full bg-emerald-500" />
//             <span className="h-2 w-8 rounded-full bg-gray-200" />
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 pt-10">
//         <header className="mb-10">
//           <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
//             Confirm <span className="text-emerald-600">Delivery</span>
//           </h1>
//           <p className="text-gray-500 mt-2 font-medium">
//             Verify your address and choose a payment method.
//           </p>
//         </header>

//         <div className="grid grid-cols-12 gap-8 lg:gap-12">
//           <div className="col-span-12 lg:col-span-8 space-y-6">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
//                   <MapPin size={24} />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900">
//                   Shipping Details
//                 </h2>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="relative group">
//                   <User
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
//                     size={18}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Recipient Name"
//                     value={address.fullName}
//                     onChange={(e) =>
//                       setAddress({ ...address, fullName: e.target.value })
//                     }
//                     className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
//                   />
//                 </div>
//                 <div className="relative group">
//                   <Phone
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
//                     size={18}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Mobile Number"
//                     value={address.mobile}
//                     onChange={(e) =>
//                       setAddress({ ...address, mobile: e.target.value })
//                     }
//                     className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
//                   />
//                 </div>
//                 <div className="md:col-span-2 relative group">
//                   <Home
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors"
//                     size={18}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Full Street Address"
//                     value={address.fullAddress}
//                     onChange={(e) =>
//                       setAddress({ ...address, fullAddress: e.target.value })
//                     }
//                     className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
//                   />
//                 </div>
//               </div>

//               <div className="mt-8 space-y-4">
//                 <div className="flex gap-2">
//                   <div className="relative flex-1 group">
//                     <Search
//                       className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
//                       size={18}
//                     />
//                     <input
//                       type="text"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       placeholder="Search for a nearby landmark..."
//                       className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm"
//                     />
//                   </div>
//                   <button
//                     onClick={handleSearchQuery}
//                     className="bg-emerald-600 text-white px-8 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
//                   >
//                     Locate
//                   </button>
//                 </div>

//                 <div className="relative h-[350px] rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner z-0">
//                   {position && (
//                     <MapContainer
//                       center={position as LatLngExpression}
//                       zoom={13}
//                       scrollWheelZoom={false}
//                       className="w-full h-full"
//                     >
//                       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                       <DraggableMarker />
//                     </MapContainer>
//                   )}
//                   <motion.button
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => {
//                       if (navigator.geolocation) {
//                         navigator.geolocation.getCurrentPosition((pos) =>
//                           setPosition([
//                             pos.coords.latitude,
//                             pos.coords.longitude,
//                           ]),
//                         );
//                       }
//                     }}
//                     className="absolute bottom-6 right-6 bg-white text-emerald-600 p-4 rounded-2xl shadow-2xl z-[500] hover:bg-emerald-50 transition-colors"
//                   >
//                     <LocateFixed size={24} />
//                   </motion.button>
//                 </div>
//               </div>
//             </motion.div>
//           </div>

//           <div className="col-span-12 lg:col-span-4">
//             <div className="sticky top-28 space-y-6">
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50"
//               >
//                 <h2 className="text-xl font-bold text-gray-900 mb-6">
//                   Payment Method
//                 </h2>

//                 <div className="space-y-3 mb-8">
//                   <button
//                     onClick={() => setPaymentMethod("online")}
//                     className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
//                       paymentMethod === "online"
//                         ? "border-emerald-600 bg-emerald-50/50"
//                         : "border-gray-50 bg-gray-50 hover:border-gray-200"
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`p-2 rounded-lg ${paymentMethod === "online" ? "bg-emerald-600 text-white" : "bg-white text-gray-400"}`}
//                       >
//                         <CreditCardIcon size={20} />
//                       </div>
//                       <span
//                         className={`font-bold text-sm ${paymentMethod === "online" ? "text-emerald-900" : "text-gray-500"}`}
//                       >
//                         Stripe Online
//                       </span>
//                     </div>
//                     <div
//                       className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "online" ? "border-emerald-600" : "border-gray-300"}`}
//                     >
//                       {paymentMethod === "online" && (
//                         <div className="h-2.5 w-2.5 bg-emerald-600 rounded-full" />
//                       )}
//                     </div>
//                   </button>

//                   <button
//                     onClick={() => setPaymentMethod("cod")}
//                     className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
//                       paymentMethod === "cod"
//                         ? "border-emerald-600 bg-emerald-50/50"
//                         : "border-gray-50 bg-gray-50 hover:border-gray-200"
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`p-2 rounded-lg ${paymentMethod === "cod" ? "bg-emerald-600 text-white" : "bg-white text-gray-400"}`}
//                       >
//                         <Truck size={20} />
//                       </div>
//                       <span
//                         className={`font-bold text-sm ${paymentMethod === "cod" ? "text-emerald-900" : "text-gray-500"}`}
//                       >
//                         Cash on Delivery
//                       </span>
//                     </div>
//                     <div
//                       className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cod" ? "border-emerald-600" : "border-gray-300"}`}
//                     >
//                       {paymentMethod === "cod" && (
//                         <div className="h-2.5 w-2.5 bg-emerald-600 rounded-full" />
//                       )}
//                     </div>
//                   </button>
//                 </div>

//                 <div className="space-y-4 pt-6 border-t border-dashed border-gray-200">
//                   <div className="flex justify-between text-gray-500 font-medium">
//                     <span>Subtotal</span>
//                     <span className="text-gray-900 font-bold">
//                       ₦{subTotal.toLocaleString()}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-gray-500 font-medium">
//                     <span>Delivery Fee</span>
//                     <span className="text-emerald-600 font-bold">
//                       ₦{deliveryFee.toLocaleString()}
//                     </span>
//                   </div>

//                   <div className="pt-6">
//                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
//                       Final Amount
//                     </p>
//                     <p className="text-4xl font-black text-gray-900 leading-tight">
//                       ₦{finalTotal.toLocaleString()}
//                     </p>
//                   </div>

//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all mt-4"
//                     onClick={() => {
//                       if (paymentMethod == "cod") {
//                         handleCod();
//                       } else {
//                         // eslint-disable-next-line @typescript-eslint/no-unused-expressions
//                         null
//                         // handleOnlineOrder();
//                       }
//                     }}
//                   >
//                     {paymentMethod === "cod"
//                       ? "Place Order"
//                       : "Proceed to Payment"}
//                   </motion.button>
//                 </div>
//               </motion.div>

//               <div className="bg-emerald-900 p-6 rounded-[2rem] text-white flex items-center gap-4">
//                 <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
//                   <ShieldCheck size={24} />
//                 </div>
//                 <div>
//                   <p className="text-xs font-bold uppercase tracking-widest opacity-60">
//                     Buyer Protection
//                   </p>
//                   <p className="text-sm font-medium">
//                     Your payment information is encrypted and secure.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;
