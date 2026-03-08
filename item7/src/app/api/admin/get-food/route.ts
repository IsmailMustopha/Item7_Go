import Food from "@/models/food.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const groceries = await Food.find({});
    return NextResponse.json(groceries, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `get food error ${error}` },
      { status: 200 },
    );
  }
}
