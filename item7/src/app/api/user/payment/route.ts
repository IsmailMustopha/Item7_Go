import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { userId, items, paymentMethod, totalAmount, address } =
      await req.json();

    if (!items || !userId || !paymentMethod || !totalAmount || !address) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedItems = items.map((item: any) => ({
      food: item.food || item._id, 
      name: item.name,
      price: item.price.toString(), 
      image: item.image,
      quantity: item.quantity,
    }));

    
  const newOrder = await Order.create({
    user: userId,
    items: formattedItems, 
    totalAmount,
    address,
    paymentMethod,
    status: "pending",
    isPaid: false,
  });

    
    
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: `snapcart-${newOrder._id}-${Date.now()}`, 
        amount: totalAmount,
        currency: "NGN", 
        redirect_url: `${process.env.NEXT_BASE_URL}/user/payment/verify`,
        customer: {
          email: user.email,
          phone_number: address.mobile,
          name: address.fullName,
        },
        customizations: {
          title: "Item7 Checkout",
          description: "Payment for food order",
          logo: "https://your-logo-url.com/logo.png",
        },
        meta: {
          orderId: newOrder._id.toString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        },
      },
    );

    if (response.data.status === "success") {
      return NextResponse.json(
        { url: response.data.data.link },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        { message: "Flutterwave error" },
        { status: 400 },
      );
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Flutterwave Error:", error.response?.data || error.message);
    return NextResponse.json(
      { message: "Internal Server Error during payment initialization" },
      { status: 500 },
    );
  }
}
