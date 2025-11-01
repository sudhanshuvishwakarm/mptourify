// GET NEWS BY DISTRICT
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import News from "@/models/newsModel.js";
import District from "@/models/districtModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
import Admin from "@/models/adminModel.js";
import mongoose from "mongoose";

connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { districtId } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(districtId)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid district ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF DISTRICT EXISTS
        const district = await District.findById(districtId);
        if (!district) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "District not found" 
                },
                { status: 404 }
            );
        }

        // GET QUERY PARAMETERS
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit')) || 20;

        // BUILD QUERY
        let query = { 
            relatedDistrict: districtId,
            status: 'published'
        };
        
        if (category) {
            query.category = category;
        }

        // FETCH NEWS
        const news = await News.find(query)
            .select('title slug excerpt featuredImage category publishDate')
            .populate('author', 'name')
            .populate('relatedPanchayat', 'name slug')
            .sort({ publishDate: -1 })
            .limit(limit);

        return NextResponse.json(
            { 
                success: true,
                count: news.length,
                district: {
                    id: district._id,
                    name: district.name,
                    slug: district.slug
                },
                news
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get News by District Error:", error);
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