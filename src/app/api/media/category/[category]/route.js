// GET MEDIA BY CATEGORY
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import Media from "@/models/mediaModel.js";
import District from "@/models/districtModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
import Admin from "@/models/adminModel.js";
connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { category } = await params;

        // VALIDATE CATEGORY
        const validCategories = ['heritage', 'natural', 'cultural', 'event', 'festival'];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
                },
                { status: 400 }
            );
        }

        // GET QUERY PARAMETERS
        const { searchParams } = new URL(request.url);
        const fileType = searchParams.get('type');
        const limit = parseInt(searchParams.get('limit')) || 50;

        // BUILD QUERY
        let query = { category, status: 'approved' };
        
        if (fileType && ['image', 'video'].includes(fileType)) {
            query.fileType = fileType;
        }

        // FETCH MEDIA
        const media = await Media.find(query)
            .populate('district', 'name slug')
            .populate('gramPanchayat', 'name slug')
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit);

        return NextResponse.json({ 
                success: true,
                count: media.length,
                category,
                media
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Media by Category Error:", error);
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