import { NextResponse } from "next/server";

// http://localhost:3000/api/hello
export async function GET() {
    return NextResponse.json({ message: "hello world" }, { status: 200 });
}