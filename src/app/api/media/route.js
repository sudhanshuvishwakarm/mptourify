// GET ALL MEDIA WITH FILTERS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import Media from "@/models/mediaModel.js";
import District from "@/models/districtModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
import Admin from "@/models/adminModel.js";
connectDB();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // QUERY PARAMETERS
        const fileType = searchParams.get('type'); // image or video
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const district = searchParams.get('district');
        const panchayat = searchParams.get('panchayat');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');
        const featured = searchParams.get('featured'); // true/false
        const sort = searchParams.get('sort') || 'createdAt';
        const order = searchParams.get('order') || 'desc';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const admin = searchParams.get('admin'); // New parameter for admin requests

        // BUILD QUERY
        let query = {};
        
        if (fileType && ['image', 'video'].includes(fileType)) {
            query.fileType = fileType;
        }
        
        if (category) {
            query.category = category;
        }
        
        // KEY CHANGE: Only default to 'approved' for public requests
        if (status && ['approved', 'pending', 'rejected'].includes(status)) {
            query.status = status;
        } else {
            // If admin parameter is true, show all media (no status filter)
            // If admin parameter is false or not provided, show only approved
            if (admin !== 'true') {
                query.status = 'approved';
            }
            // If admin=true and no status specified, no status filter is applied (shows all)
        }
        
        if (district) {
            query.district = district;
        }
        
        if (panchayat) {
            query.gramPanchayat = panchayat;
        }
        
        if (tag) {
            query.tags = { $in: [tag] };
        }
        
        if (featured === 'true') {
            query.featured = true;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { photographer: { $regex: search, $options: 'i' } }
            ];
        }

        // BUILD SORT
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sort]: sortOrder };

        // CALCULATE PAGINATION
        const skip = (page - 1) * limit;

        // FETCH MEDIA
        const media = await Media.find(query)
            .populate('district', 'name slug')
            .populate('gramPanchayat', 'name slug')
            .populate('uploadedBy', 'name email role')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        // GET TOTAL COUNT
        const totalMedia = await Media.countDocuments(query);
        const totalPages = Math.ceil(totalMedia / limit);

        // GET STATISTICS
        const imageCount = await Media.countDocuments({ ...query, fileType: 'image' });
        const videoCount = await Media.countDocuments({ ...query, fileType: 'video' });

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
                media
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get All Media Error:", error);
        return NextResponse.json(
            { 
                success: false,
                message: "Internal Server Error",
                error: error.message 
            },
            { status: 500 }
        );
    }
}   // GET ALL MEDIA WITH FILTERS
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import Media from "@/models/mediaModel.js";
// import District from "@/models/districtModel.js";
// import GramPanchayat from "@/models/panchayatModel.js";
// import Admin from "@/models/adminModel.js";
// connectDB();

// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
        
//         // QUERY PARAMETERS
//         const fileType = searchParams.get('type'); // image or video
//         const category = searchParams.get('category');
//         const status = searchParams.get('status');
//         const district = searchParams.get('district');
//         const panchayat = searchParams.get('panchayat');
//         const tag = searchParams.get('tag');
//         const search = searchParams.get('search');
//         const featured = searchParams.get('featured'); // true/false
//         const sort = searchParams.get('sort') || 'createdAt';
//         const order = searchParams.get('order') || 'desc';
//         const page = parseInt(searchParams.get('page')) || 1;
//         const limit = parseInt(searchParams.get('limit')) || 20;

//         // BUILD QUERY
//         let query = {};
        
//         if (fileType && ['image', 'video'].includes(fileType)) {
//             query.fileType = fileType;
//         }
        
//         if (category) {
//             query.category = category;
//         }
        
//         if (status && ['approved', 'pending', 'rejected'].includes(status)) {
//             query.status = status;
//         } else {
//             query.status = 'approved'; // Default: show only approved
//         }
        
//         if (district) {
//             query.district = district;
//         }
        
//         if (panchayat) {
//             query.gramPanchayat = panchayat;
//         }
        
//         if (tag) {
//             query.tags = { $in: [tag] };
//         }
        
//         if (featured === 'true') {
//             query.featured = true;
//         }
        
//         if (search) {
//             query.$or = [
//                 { title: { $regex: search, $options: 'i' } },
//                 { description: { $regex: search, $options: 'i' } },
//                 { photographer: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // BUILD SORT
//         const sortOrder = order === 'desc' ? -1 : 1;
//         const sortObj = { [sort]: sortOrder };

//         // CALCULATE PAGINATION
//         const skip = (page - 1) * limit;

//         // FETCH MEDIA
//         const media = await Media.find(query)
//             .populate('district', 'name slug')
//             .populate('gramPanchayat', 'name slug')
//             .populate('uploadedBy', 'name email role')
//             .sort(sortObj)
//             .skip(skip)
//             .limit(limit);

//         // GET TOTAL COUNT
//         const totalMedia = await Media.countDocuments(query);
//         const totalPages = Math.ceil(totalMedia / limit);

//         // GET STATISTICS
//         const imageCount = await Media.countDocuments({ ...query, fileType: 'image' });
//         const videoCount = await Media.countDocuments({ ...query, fileType: 'video' });

//         return NextResponse.json(
//             { 
//                 success: true,
//                 count: media.length,
//                 totalMedia,
//                 currentPage: page,
//                 totalPages,
//                 stats: {
//                     images: imageCount,
//                     videos: videoCount
//                 },
//                 media
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get All Media Error:", error);
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