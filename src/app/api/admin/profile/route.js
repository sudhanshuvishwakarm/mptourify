import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import Admin from "@/models/adminModel.js";
import bcrypt from "bcryptjs";

connectDB();

// GET PROFILE
export async function GET(request) {
    try {
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

// UPDATE OWN PROFILE
export async function PUT(request) {
    try {
        const currentAdmin = await getAdmin();

        if (!currentAdmin) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Not authenticated" 
                },
                { status: 401 }
            );
        }

        const { name, phone, employeeId, designation, currentPassword, newPassword } = await request.json();

        // VALIDATE AT LEAST ONE FIELD TO UPDATE
        if (!name && !phone && !employeeId && !designation && !newPassword) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide at least one field to update" 
                },
                { status: 400 }
            );
        }

        // IF PASSWORD CHANGE REQUESTED
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Current password is required to change password" 
                    },
                    { status: 400 }
                );
            }

            // VERIFY CURRENT PASSWORD
            const admin = await Admin.findById(currentAdmin._id);
            const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
            
            if (!isPasswordValid) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Current password is incorrect" 
                    },
                    { status: 401 }
                );
            }

            // HASH NEW PASSWORD
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            admin.password = hashedPassword;
            await admin.save();
        }

        // UPDATE OTHER FIELDS
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (employeeId) updateData.employeeId = employeeId;
        if (designation) updateData.designation = designation;

        const updatedAdmin = await Admin.findByIdAndUpdate(
            currentAdmin._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        return NextResponse.json(
            { 
                success: true,
                message: "Profile updated successfully",
                admin: {
                    id: updatedAdmin._id,
                    name: updatedAdmin.name,
                    email: updatedAdmin.email,
                    role: updatedAdmin.role,
                    phone: updatedAdmin.phone,
                    employeeId: updatedAdmin.employeeId,
                    designation: updatedAdmin.designation,
                    assignedDistricts: updatedAdmin.assignedDistricts
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Profile Error:", error);
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