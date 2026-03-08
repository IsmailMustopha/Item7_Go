import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Food from "@/models/food.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { message: "you are not admin" },
        { status: 400 },
      );
    }

    const { foodId } = await req.json();

    const food = await Food.findByIdAndDelete(foodId);

    return NextResponse.json(food, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
