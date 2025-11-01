// GET LATEST 5 NEWS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import Admin from "@/models/adminModel.js";
import District from "@/models/districtModel.js";
import News from "@/models/newsModel.js";

connectDB();

export async function GET(request) {
    try {
        // GET QUERY PARAMETER FOR LIMIT (DEFAULT 5)
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 5;

        // FETCH LATEST PUBLISHED NEWS
        const latestNews = await News.find({ status: 'published' })
            .select('title slug excerpt featuredImage category publishDate featured')
            .populate('author', 'name')
            .populate('relatedDistrict', 'name slug')
            .sort({ publishDate: -1 })
            .limit(limit);

        return NextResponse.json(
            { 
                success: true,
                count: latestNews.length,
                news: latestNews
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Latest News Error:", error);
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
