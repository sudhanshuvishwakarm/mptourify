import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import Admin from "@/models/adminModel.js";
import mongoose from "mongoose";

connectDB();

export async function PUT(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can change status." 
                },
                { status: 403 }
            );
        }

        // AWAIT BOTH context AND params
        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid admin ID" 
                },
                { status: 400 }
            );
        }

        // PREVENT CHANGING OWN STATUS
        if (currentAdmin._id.toString() === id) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "You cannot change your own account status" 
                },
                { status: 400 }
            );
        }

        const { status } = await request.json();

        // VALIDATE STATUS
        if (!status || !['active', 'inactive'].includes(status)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid status. Must be 'active' or 'inactive'" 
                },
                { status: 400 }
            );
        }

        // CHECK IF ADMIN EXISTS
        const admin = await Admin.findById(id);
        if (!admin) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Admin not found" 
                },
                { status: 404 }
            );
        }

        // UPDATE STATUS
        admin.status = status;
        await admin.save();

        return NextResponse.json(
            { 
                success: true,
                message: `Admin ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    status: admin.status
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Status Error:", error);
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