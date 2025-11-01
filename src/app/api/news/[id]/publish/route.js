//  PUBLISH NEWS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import News from "@/models/newsModel.js";
import Admin from "@/models/adminModel.js";
import District from "@/models/districtModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
import mongoose from "mongoose";

connectDB();

export async function PUT(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can publish news articles." 
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
                    message: "Invalid news ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF NEWS EXISTS
        const news = await News.findById(id);
        if (!news) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News article not found" 
                },
                { status: 404 }
            );
        }

        // CHECK IF ALREADY PUBLISHED
        if (news.status === 'published') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News article is already published" 
                },
                { status: 400 }
            );
        }

        // PUBLISH NEWS
        news.status = 'published';
        news.publishDate = new Date();
        await news.save();

        // POPULATE RELATIONS
        await news.populate('author', 'name email');
        await news.populate('relatedDistrict', 'name slug');
        await news.populate('relatedPanchayat', 'name slug');

        return NextResponse.json(
            { 
                success: true,
                message: "News article published successfully",
                news
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Publish News Error:", error);
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