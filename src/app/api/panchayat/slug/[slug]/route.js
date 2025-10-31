// GET PANCHAYAT BY SLUG
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import GramPanchayat from "@/models/panchayatModel.js";

connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { slug } = await params;

        // FIND PANCHAYAT BY SLUG
        const panchayat = await GramPanchayat.findOne({ 
            slug: slug.toLowerCase()
        })
        .populate('district', 'name slug headerImage')
        .populate('createdBy', 'name email role')
        .populate('photoGallery')
        .populate('videoGallery')
        .populate('rtcReport.coordinator', 'name email employeeId');

        if (!panchayat) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Gram Panchayat not found" 
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true,
                panchayat
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Panchayat by Slug Error:", error);
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