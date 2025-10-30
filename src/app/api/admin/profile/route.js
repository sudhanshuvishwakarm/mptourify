import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";

connectDB();

export async function GET(request) {
    try {
        // GET CURRENT ADMIN
        const admin = await getAdmin();

        if (!admin) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Not authenticated" 
                },
                { status: 401 }
            );
        }

        // SEND PROFILE DATA
        return NextResponse.json(
            { 
                success: true,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    phone: admin.phone,
                    employeeId: admin.employeeId,
                    designation: admin.designation,
                    assignedDistricts: admin.assignedDistricts,
                    status: admin.status,
                    lastLogin: admin.lastLogin,
                    createdAt: admin.createdAt
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Profile Error:", error);
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