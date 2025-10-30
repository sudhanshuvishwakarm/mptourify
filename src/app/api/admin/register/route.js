import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "@/models/adminModel.js";
import { cookies } from "next/headers";
import { isAdmin } from "@/utils/getAdmin.js";

connectDB();

export async function POST(request) {
    try {
        // CHECK IF CURRENT USER IS ADMIN (Comment this for first admin creation)
        const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();
        if (!hasAdminRole) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can create new accounts." 
                },
                { status: 403 }
            );
        }

        // GET REQUEST DATA
        const adminData = await request.json();
        const { 
            name, 
            email, 
            password, 
            phone, 
            role, 
            assignedDistricts, 
            employeeId, 
            designation 
        } = adminData;

        // VALIDATE REQUIRED FIELDS
        if (!name || !email || !password || !phone || !role) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide all required fields: name, email, password, phone, role" 
                },
                { status: 400 }
            );
        }

        // VALIDATE EMAIL FORMAT
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid email format" 
                },
                { status: 400 }
            );
        }

        // VALIDATE ROLE
        if (!['admin', 'rtc'].includes(role)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid role. Must be 'admin' or 'rtc'" 
                },
                { status: 400 }
            );
        }

        // CHECK IF RTC HAS ASSIGNED DISTRICTS
        if (role === 'rtc' && (!assignedDistricts || assignedDistricts.length === 0)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "RTC must have at least one assigned district" 
                },
                { status: 400 }
            );
        }

        // CHECK IF ADMIN ALREADY EXISTS
        const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Admin with this email already exists" 
                },
                { status: 409 }
            );
        }

        // HASH PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // CREATE NEW ADMIN
        const newAdmin = await Admin.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            role,
            assignedDistricts: role === 'rtc' ? assignedDistricts : [],
            employeeId: employeeId || null,
            designation: designation || null,
            status: 'active',
            lastLogin: null
        });

        // SEND SUCCESS RESPONSE
        return NextResponse.json(
            { 
                success: true,
                message: `${role === 'admin' ? 'Admin' : 'RTC'} registered successfully`,
                admin: {
                    id: newAdmin._id,
                    name: newAdmin.name,
                    email: newAdmin.email,
                    role: newAdmin.role,
                    phone: newAdmin.phone,
                    employeeId: newAdmin.employeeId,
                    designation: newAdmin.designation,
                    assignedDistricts: newAdmin.assignedDistricts
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Registration Error:", error);
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