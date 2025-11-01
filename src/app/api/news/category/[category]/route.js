//  GET NEWS BY CATEGORY
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import News from "@/models/newsModel.js";
import Admin from "@/models/adminModel.js";
import District from "@/models/districtModel.js";

connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { category } = await params;

        // VALIDATE CATEGORY
        const validCategories = ['media_coverage', 'press_release', 'announcement', 'update'];
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
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        // CALCULATE PAGINATION
        const skip = (page - 1) * limit;

        // FETCH NEWS BY CATEGORY
        const news = await News.find({ 
            category,
            status: 'published'
        })
        .select('title slug excerpt featuredImage publishDate featured')
        .populate('author', 'name')
        .populate('relatedDistrict', 'name slug')
        .sort({ publishDate: -1 })
        .skip(skip)
        .limit(limit);

        // GET TOTAL COUNT
        const totalNews = await News.countDocuments({ category, status: 'published' });
        const totalPages = Math.ceil(totalNews / limit);

        return NextResponse.json(
            { 
                success: true,
                count: news.length,
                totalNews,
                currentPage: page,
                totalPages,
                category,
                news
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get News by Category Error:", error);
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