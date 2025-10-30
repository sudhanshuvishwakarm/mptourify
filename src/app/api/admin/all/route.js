import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import Admin from "@/models/adminModel.js";
import District from "@/models/districtModel.js";

connectDB();

export async function GET(request) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can view all accounts." 
                },
                { status: 403 }
            );
        }

        // GET QUERY PARAMETERS
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role'); // Filter by role
        const status = searchParams.get('status'); // Filter by status
        const search = searchParams.get('search'); // Search by name/email

        // BUILD QUERY
        let query = {};
        
        if (role && ['admin', 'rtc'].includes(role)) {
            query.role = role;
        }
        
        if (status && ['active', 'inactive'].includes(status)) {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        // FETCH ALL ADMINS
        const admins = await Admin.find(query)
            .select('-password')
            .populate('assignedDistricts', 'name')
            .sort({ createdAt: -1 });

        // GET COUNTS
        const totalAdmins = await Admin.countDocuments({ role: 'admin' });
        const totalRTCs = await Admin.countDocuments({ role: 'rtc' });
        const activeCount = await Admin.countDocuments({ status: 'active' });
        const inactiveCount = await Admin.countDocuments({ status: 'inactive' });

        return NextResponse.json(
            { 
                success: true,
                count: admins.length,
                stats: {
                    totalAdmins,
                    totalRTCs,
                    activeCount,
                    inactiveCount
                },
                admins
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get All Admins Error:", error);
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