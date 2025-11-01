// GET MEDIA BY PANCHAYAT
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import Media from "@/models/mediaModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
import District from "@/models/districtModel.js";
import Admin from "@/models/adminModel.js";
import mongoose from "mongoose";

connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { panchayatId } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(panchayatId)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid panchayat ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF PANCHAYAT EXISTS
        const panchayat = await GramPanchayat.findById(panchayatId).populate('district', 'name slug');
        if (!panchayat) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Panchayat not found" 
                },
                { status: 404 }
            );
        }

        // GET QUERY PARAMETERS
        const { searchParams } = new URL(request.url);
        const fileType = searchParams.get('type');
        const category = searchParams.get('category');

        // BUILD QUERY
        let query = { gramPanchayat: panchayatId, status: 'approved' };
        
        if (fileType && ['image', 'video'].includes(fileType)) {
            query.fileType = fileType;
        }
        
        if (category) {
            query.category = category;
        }

        // FETCH MEDIA
        const media = await Media.find(query)
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(
            { 
                success: true,
                count: media.length,
                panchayat: {
                    id: panchayat._id,
                    name: panchayat.name,
                    slug: panchayat.slug,
                    district: panchayat.district
                },
                media
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Media by Panchayat Error:", error);
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