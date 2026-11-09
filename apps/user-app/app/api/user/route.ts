import { NextResponse } from "next/server";
import { prisma } from "@repo/db/client";

export async function GET() {
  try {
    const user = await prisma.user.create({
    data: {
      email: "nikhil90123@gmail.com",
      password: "123456",
      name: "Nikhil",
    },
  });

  return NextResponse.json({ user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}