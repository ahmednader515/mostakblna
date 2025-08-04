import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { fullName, phoneNumber, parentPhoneNumber, password, confirmPassword } = await req.json();

    if (!fullName || !phoneNumber || !parentPhoneNumber || !password || !confirmPassword) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (password !== confirmPassword) {
      return new NextResponse("Passwords do not match", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          { parentPhoneNumber }
        ]
      },
    });

    if (existingUser) {
      if (existingUser.phoneNumber === phoneNumber) {
        return new NextResponse("Phone number already exists", { status: 400 });
      }
      if (existingUser.parentPhoneNumber === parentPhoneNumber) {
        return new NextResponse("Parent phone number already exists", { status: 400 });
      }
    }

    // Hash password (no complexity requirements)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user directly without email verification
    await db.user.create({
      data: {
        fullName,
        phoneNumber,
        parentPhoneNumber,
        hashedPassword,
        role: "USER",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REGISTER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 