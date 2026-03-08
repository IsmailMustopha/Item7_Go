import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const { userId, items, paymentMethod, totalAmount, address } = body;

    if (!items || !userId || !paymentMethod || !totalAmount || !address) {
      return NextResponse.json(
        { message: "Missing required fields",},
        { status: 400 },
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedItems = items.map((item: any) => ({
      food: item.foodId || item._id,
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

    await emitEventHandler("new-order", newOrder)
    return NextResponse.json(newOrder, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while placing the order" },
      { status: 500 },
    );
  }
}

