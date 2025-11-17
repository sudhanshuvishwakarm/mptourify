// GET MEDIA BY DISTRICT
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import Media from "@/models/mediaModel.js";
import District from "@/models/districtModel.js";
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
        const fileType = searchParams.get('type');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;

        // BUILD QUERY
        let query = { district: districtId };
        
        if (fileType && ['image', 'video'].includes(fileType)) {
            query.fileType = fileType;
        }
        
        if (category) {
            query.category = category;
        }
        
        if (status && ['approved', 'pending', 'rejected'].includes(status)) {
            query.status = status;
        } else {
            query.status = 'approved';
        }

        // CALCULATE PAGINATION
        const skip = (page - 1) * limit;

        // FETCH MEDIA
        const media = await Media.find(query)
            .populate('gramPanchayat', 'name slug')
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // GET COUNTS
        const totalMedia = await Media.countDocuments(query);
        const totalPages = Math.ceil(totalMedia / limit);
        const imageCount = await Media.countDocuments({ district: districtId, fileType: 'image', status: 'approved' });
        const videoCount = await Media.countDocuments({ district: districtId, fileType: 'video', status: 'approved' });

        return NextResponse.json(
            { 
                success: true,
                count: media.length,
                totalMedia,
                currentPage: page,
                totalPages,
                stats: {
                    images: imageCount,
                    videos: videoCount
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
        console.error("Get Media by District Error:", error);
        return NextResponse.json(
            { 
                success: false,
                message: "Internal Server Error",
                error: error.message 
            },
            { status: 500 }
        );
    }
}// // GET MEDIA BY DISTRICT
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import Media from "@/models/mediaModel.js";
// import District from "@/models/districtModel.js";
// import GramPanchayat from "@/models/panchayatModel.js";
// import Admin from "@/models/adminModel.js";
// import mongoose from "mongoose";

// connectDB();

// export async function GET(request, context) {
//     try {
//         const { params } = await context;
//         const { districtId } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(districtId)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid district ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF DISTRICT EXISTS
//         const district = await District.findById(districtId);
//         if (!district) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "District not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // GET QUERY PARAMETERS
//         const { searchParams } = new URL(request.url);
//         const fileType = searchParams.get('type');
//         const category = searchParams.get('category');
//         const status = searchParams.get('status');

//         // BUILD QUERY
//         let query = { district: districtId };
        
//         if (fileType && ['image', 'video'].includes(fileType)) {
//             query.fileType = fileType;
//         }
        
//         if (category) {
//             query.category = category;
//         }
        
//         if (status && ['approved', 'pending', 'rejected'].includes(status)) {
//             query.status = status;
//         } else {
//             query.status = 'approved';
//         }

//         // FETCH MEDIA
//         const media = await Media.find(query)
//             .populate('gramPanchayat', 'name slug')
//             .populate('uploadedBy', 'name email')
//             .sort({ createdAt: -1 });

//         // GET COUNTS
//         const imageCount = await Media.countDocuments({ district: districtId, fileType: 'image', status: 'approved' });
//         const videoCount = await Media.countDocuments({ district: districtId, fileType: 'video', status: 'approved' });

//         return NextResponse.json(
//             { 
//                 success: true,
//                 count: media.length,
//                 stats: {
//                     images: imageCount,
//                     videos: videoCount
//                 },
//                 district: {
//                     id: district._id,
//                     name: district.name,
//                     slug: district.slug
//                 },
//                 media
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get Media by District Error:", error);
//         return NextResponse.json(
//             { 
//                 success: false,
//                 message: "Internal Server Error",
//                 error: error.message 
//             },
//             { status: 500 }
//         );
//     }
// }