import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
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

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const foodId = formData.get("foodId") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const file = formData.get("image") as Blob | null;

    let imageUrl;
    if (file) {
      imageUrl = await uploadOnCloudinary(file);
    }

    const food = await Food.findByIdAndUpdate(foodId, {
      name,
      price,
      category,
      image: imageUrl,
    });

    return NextResponse.json(
      { message: "Food edited successfully", food },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
