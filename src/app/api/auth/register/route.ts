import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validate input using Zod
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // 3. Hash password (Security Best Practice)
    // Using bcrypt with 12 salt rounds is recommended for production
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // 5. Return success (excluding password hash)
    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: { id: user.id, name: user.name, email: user.email } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
