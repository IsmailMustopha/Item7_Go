import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const transaction_id = searchParams.get("transaction_id");
  const tx_ref = searchParams.get("tx_ref");

  console.log("Verifying transaction:", { transaction_id, tx_ref, status });

  if (!status || !transaction_id) {
    return NextResponse.json(
      { message: "Parameters pending" },
      { status: 202 },
    );
  }

  if (status === "successful" || status === "completed") {
    try {
      
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        },
      );

      if (response.data.data.status === "successful") {
        await connectDb();

        
        const orderId = tx_ref?.split("-")[1];

        if (!orderId) {
          return NextResponse.json(
            { message: "Invalid Reference" },
            { status: 400 },
          );
        }

        
        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { isPaid: true },
          { new: true },
        );

        if (!updatedOrder) {
          return NextResponse.json(
            { message: "Order not found" },
            { status: 404 },
          );
        }

        return NextResponse.json(
          { success: true, message: "Order Verified" },
          { status: 200 },
        );
      }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Flutterwave Error:",
        error.response?.data || error.message,
      );
      return NextResponse.json(
        { message: "Server Verification Error" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { success: false, message: "Payment Failed" },
    { status: 400 },
  );
}
