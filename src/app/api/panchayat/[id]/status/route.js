//  UPDATE PANCHAYAT STATUS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel.js";

connectDB();

export async function PUT(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can change panchayat status." 
                },
                { status: 403 }
            );
        }

        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid panchayat ID" 
                },
                { status: 400 }
            );
        }

        const { status } = await request.json();

        // VALIDATE STATUS
        if (!status || !['verified', 'pending', 'draft'].includes(status)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid status. Must be 'verified', 'pending', or 'draft'" 
                },
                { status: 400 }
            );
        }

        // CHECK IF PANCHAYAT EXISTS
        const panchayat = await GramPanchayat.findById(id);
        if (!panchayat) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Gram Panchayat not found" 
                },
                { status: 404 }
            );
        }

        // UPDATE STATUS
        panchayat.status = status;
        await panchayat.save();

        // POPULATE RELATIONS
        await panchayat.populate('district', 'name slug');

        return NextResponse.json(
            { 
                success: true,
                message: `Panchayat status changed to '${status}' successfully`,
                panchayat: {
                    id: panchayat._id,
                    name: panchayat.name,
                    slug: panchayat.slug,
                    district: panchayat.district,
                    status: panchayat.status
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Panchayat Status Error:", error);
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