// GET MEDIA OF DISTRICT
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import District from "@/models/districtModel.js";
import mongoose from "mongoose";
import Media from "@/models/mediaModel.js";

connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid district ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF DISTRICT EXISTS
        const district = await District.findById(id);
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
        const fileType = searchParams.get('type'); // image or video
        const category = searchParams.get('category');
        const status = searchParams.get('status');

        // BUILD QUERY
        let query = { district: id };
        
        if (fileType && ['image', 'video'].includes(fileType)) {
            query.fileType = fileType;
        }
        
        if (category) {
            query.category = category;
        }
        
        if (status && ['approved', 'pending', 'rejected'].includes(status)) {
            query.status = status;
        } else {
            query.status = 'approved'; // Default show only approved
        }

        // FETCH MEDIA
        const media = await Media.find(query)
            .populate('uploadedBy', 'name email')
            .populate('gramPanchayat', 'name')
            .sort({ createdAt: -1 });

        // COUNT BY TYPE
        const imageCount = await Media.countDocuments({ 
            district: id, 
            fileType: 'image',
            status: 'approved' 
        });
        const videoCount = await Media.countDocuments({ 
            district: id, 
            fileType: 'video',
            status: 'approved' 
        });

        return NextResponse.json(
            { 
                success: true,
                count: media.length,
                stats: {
                    totalImages: imageCount,
                    totalVideos: videoCount
                },
                district: {
                    id: district._id,
                    name: district.name,
                    slug: district.slug
                },
                media
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get District Media Error:", error);
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