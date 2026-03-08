"use client";

import { useEffect, useRef, useState, Suspense } from "react"; // Added Suspense
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

// 1. Move the logic into a separate sub-component
const VerifyPaymentContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<
    "success" | "error" | null
  >(null);

  const transaction_id = searchParams.get("transaction_id");
  const tx_ref = searchParams.get("tx_ref");
  const status = searchParams.get("status");

  const hasCalled = useRef(false);

  useEffect(() => {
    if (!status || !transaction_id || hasCalled.current) return;

    const verifyPayment = async () => {
      hasCalled.current = true;
      try {
        const response = await axios.get(`/api/user/payment/verify-payment`, {
          params: { status, transaction_id, tx_ref },
        });

        if (response.data.success) {
          setVerificationStatus("success");
          setLoading(false);
          setTimeout(() => {
            router.push("/user/order-success");
          }, 2000);
        } else {
          setVerificationStatus("error");
          setLoading(false);
        }
      } catch (error) {
        console.error("Verification error", error);
        setVerificationStatus("error");
        setLoading(false);
      }
    };

    verifyPayment();
  }, [status, transaction_id, tx_ref, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {loading ? (
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold">Verifying Payment...</h2>
          <p className="text-gray-500">Please do not refresh the page.</p>
        </div>
      ) : verificationStatus === "success" ? (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-green-600">
            Payment Successful!
          </h2>
          <p className="text-gray-600">Your order has been confirmed.</p>
        </div>
      ) : (
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-red-600">
            Payment Failed
          </h2>
          <p className="text-gray-600">
            Something went wrong with your transaction.
          </p>
          <button
            onClick={() => router.push("/cart")}
            className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Go Back to Cart
          </button>
        </div>
      )}
    </div>
  );
};

// 2. Wrap the sub-component in Suspense in the main export
export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import axios from "axios";
// import { Loader2, CheckCircle, XCircle } from "lucide-react";

// const VerifyPaymentPage = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [loading, setLoading] = useState(true);
//   const [verificationStatus, setVerificationStatus] = useState<
//     "success" | "error" | null
//   >(null);

//   const transaction_id = searchParams.get("transaction_id");
//   const tx_ref = searchParams.get("tx_ref");
//   const status = searchParams.get("status");

//   const hasCalled = useRef(false);

//   useEffect(() => {
//     if (!status || !transaction_id || hasCalled.current) return;

//     const verifyPayment = async () => {
//       hasCalled.current = true;
//       try {
//         const response = await axios.get(`/api/user/payment/verify-payment`, {
//           params: { status, transaction_id, tx_ref },
//         });

//         if (response.data.success) {
//           setVerificationStatus("success");
//           setLoading(false);

//           setTimeout(() => {
//             router.push("/user/order-success");
//           }, 2000);
//         } else {
//           setVerificationStatus("error");
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error("Verification error", error);
//         setVerificationStatus("error");
//         setLoading(false);
//       }
//     };

//     verifyPayment();
//   }, [status, transaction_id, tx_ref, router]);

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4">
//       {loading ? (
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
//           <h2 className="mt-4 text-xl font-semibold">Verifying Payment...</h2>
//           <p className="text-gray-500">Please do not refresh the page.</p>
//         </div>
//       ) : verificationStatus === "success" ? (
//         <div className="text-center">
//           <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
//           <h2 className="mt-4 text-2xl font-bold text-green-600">
//             Payment Successful!
//           </h2>
//           <p className="text-gray-600">Your order has been confirmed.</p>
//         </div>
//       ) : (
//         <div className="text-center">
//           <XCircle className="w-16 h-16 text-red-500 mx-auto" />
//           <h2 className="mt-4 text-2xl font-bold text-red-600">
//             Payment Failed
//           </h2>
//           <p className="text-gray-600">
//             Something went wrong with your transaction.
//           </p>
//           <button
//             onClick={() => router.push("/cart")}
//             className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
//           >
//             Go Back to Cart
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VerifyPaymentPage;
