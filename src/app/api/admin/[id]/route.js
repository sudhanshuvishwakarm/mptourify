import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import Admin from "@/models/adminModel.js";
import District from "@/models/districtModel";
import mongoose from "mongoose";

connectDB();

// GET ADMIN BY ID
export async function GET(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Only admins can view admin details."
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

        // FIND ADMIN
        const admin = await Admin.findById(id)
            .select('-password')
            .populate('assignedDistricts', 'name slug');

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin not found"
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                admin
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Admin Error:", error);
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

// UPDATE ADMIN BY ID
export async function PUT(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Only admins can update admin details."
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

        // CHECK IF ADMIN EXISTS
        const existingAdmin = await Admin.findById(id);
        if (!existingAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin not found"
                },
                { status: 404 }
            );
        }

        const { name, phone, role, assignedDistricts, employeeId, designation, status } = await request.json();

        // VALIDATE ROLE IF PROVIDED
        if (role && !['admin', 'rtc'].includes(role)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid role. Must be 'admin' or 'rtc'"
                },
                { status: 400 }
            );
        }

        // VALIDATE STATUS IF PROVIDED
        if (status && !['active', 'inactive'].includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid status. Must be 'active' or 'inactive'"
                },
                { status: 400 }
            );
        }

        // CHECK IF RTC HAS ASSIGNED DISTRICTS
        if (role === 'rtc' && assignedDistricts && assignedDistricts.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "RTC must have at least one assigned district"
                },
                { status: 400 }
            );
        }

        // UPDATE FIELDS
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (role) updateData.role = role;
        if (assignedDistricts) updateData.assignedDistricts = assignedDistricts;
        if (employeeId !== undefined) updateData.employeeId = employeeId;
        if (designation !== undefined) updateData.designation = designation;
        if (status) updateData.status = status;

        const updatedAdmin = await Admin.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password').populate('assignedDistricts', 'name slug');

        return NextResponse.json(
            {
                success: true,
                message: "Admin updated successfully",
                admin: updatedAdmin
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Admin Error:", error);
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

// DELETE ADMIN BY ID
export async function DELETE(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Only admins can delete accounts."
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

        // PREVENT SELF-DELETION
        if (currentAdmin._id.toString() === id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot delete your own account"
                },
                { status: 400 }
            );
        }

        // CHECK IF ADMIN EXISTS
        const adminToDelete = await Admin.findById(id);
        if (!adminToDelete) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin not found"
                },
                { status: 404 }
            );
        }

        // DELETE ADMIN
        await Admin.findByIdAndDelete(id);

        return NextResponse.json(
            {
                success: true,
                message: `${adminToDelete.role === 'admin' ? 'Admin' : 'RTC'} deleted successfully`,
                deletedAdmin: {
                    id: adminToDelete._id,
                    name: adminToDelete.name,
                    email: adminToDelete.email,
                    role: adminToDelete.role
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete Admin Error:", error);
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