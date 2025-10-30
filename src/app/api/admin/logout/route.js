import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request) {
    try {
        const cookieStore = await cookies(); // AWAIT HERE
        
        // DELETE COOKIE
        cookieStore.delete('adminToken');

        return NextResponse.json(
            { 
                success: true,
                message: "Logout successful" 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Logout Error:", error);
        return NextResponse.json(
            { 
                success: false,
                message: "Internal Server Error",
                error: error.message 
            },
            { status: 500 }
        );
    }
}