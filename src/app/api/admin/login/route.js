import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "@/models/adminModel.js";
import { cookies } from "next/headers";

connectDB();

export async function POST(request) {
    try {
        // GET REQUEST DATA
        const { email, password } = await request.json();

        // VALIDATE REQUIRED FIELDS
        if (!email || !password) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide email and password" 
                },
                { status: 400 }
            );
        }

        // FIND ADMIN BY EMAIL
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid email or password" 
                },
                { status: 401 }
            );
        }

        // CHECK IF ADMIN IS ACTIVE
        if (admin.status !== 'active') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Your account is inactive. Please contact administrator." 
                },
                { status: 403 }
            );
        }

        // VERIFY PASSWORD
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid email or password" 
                },
                { status: 401 }
            );
        }

        // UPDATE LAST LOGIN
        admin.lastLogin = new Date();
        await admin.save();

        // GENERATE JWT TOKEN
        const token = jwt.sign(
            { 
                adminId: admin._id, 
                role: admin.role,
                email: admin.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: admin.role === 'admin' ? '7d' : '1d' }
        );

        // SET COOKIE (AWAIT cookies())
        const cookieStore = await cookies();
        cookieStore.set('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: admin.role === 'admin' ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days or 1 day
            path: '/'
        });

        // SEND SUCCESS RESPONSE
        return NextResponse.json(
            { 
                success: true,
                message: "Login successful",
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    phone: admin.phone,
                    employeeId: admin.employeeId,
                    designation: admin.designation,
                    assignedDistricts: admin.assignedDistricts,
                    lastLogin: admin.lastLogin
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Login Error:", error);
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