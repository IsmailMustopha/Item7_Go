import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDb from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { name, email, password } = await req.json();

    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        { message: "email already exist!" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    return NextResponse.json({ message: "User registered successfully", user }, { status: 201 });

  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}