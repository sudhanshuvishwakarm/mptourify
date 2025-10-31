// GET DISTRICT BY SLUG
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import District from "@/models/districtModel.js";

connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { slug } = await params;

        // FIND DISTRICT BY SLUG
        const district = await District.findOne({ 
            slug: slug.toLowerCase(),
            status: 'active' 
        }).populate('createdBy', 'name email');

        if (!district) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "District not found" 
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true,
                district
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get District by Slug Error:", error);
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