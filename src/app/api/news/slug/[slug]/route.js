// GET NEWS BY SLUG
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import News from "@/models/newsModel.js";
import Admin from "@/models/adminModel.js";
import District from "@/models/districtModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { slug } = await params;

        // FIND NEWS BY SLUG
        const news = await News.findOne({ 
            slug: slug.toLowerCase(),
            status: 'published' // Only show published news
        })
        .populate('author', 'name email')
        .populate('relatedDistrict', 'name slug headerImage')
        .populate('relatedPanchayat', 'name slug district');

        if (!news) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News article not found" 
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true,
                news
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get News by Slug Error:", error);
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