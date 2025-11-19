// app/api/news/panchayat/[panchayatId]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import News from "@/models/newsModel.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel.js";

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
        const panchayat = await GramPanchayat.findById(panchayatId);
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
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit')) || 20;
        const page = parseInt(searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        // BUILD QUERY
        let query = { 
            relatedPanchayat: panchayatId,
            status: 'published'
        };
        
        if (category) {
            query.category = category;
        }

        // FETCH NEWS WITH PAGINATION
        const [news, totalCount] = await Promise.all([
            News.find(query)
                .select('title slug excerpt featuredImage category publishDate createdAt')
                .populate('author', 'name')
                .populate('relatedDistrict', 'name slug')
                .sort({ publishDate: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit),
            News.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json(
            { 
                success: true,
                count: news.length,
                totalNews: totalCount,
                currentPage: page,
                totalPages,
                panchayat: {
                    id: panchayat._id,
                    name: panchayat.name,
                    slug: panchayat.slug
                },
                news
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get News by Panchayat Error:", error);
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