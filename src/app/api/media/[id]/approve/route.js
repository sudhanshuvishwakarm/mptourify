// APPROVE MEDIA
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import Media from "@/models/mediaModel.js";
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
                    message: "Unauthorized. Only admins can approve media." 
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
                    message: "Invalid media ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF MEDIA EXISTS
        const media = await Media.findById(id);
        if (!media) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Media not found" 
                },
                { status: 404 }
            );
        }

        // CHECK IF ALREADY APPROVED
        if (media.status === 'approved') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Media is already approved" 
                },
                { status: 400 }
            );
        }

        // APPROVE MEDIA
        media.status = 'approved';
        await media.save();

        // POPULATE RELATIONS
        await media.populate('district', 'name slug');
        await media.populate('gramPanchayat', 'name slug');
        await media.populate('uploadedBy', 'name email');

        return NextResponse.json(
            { 
                success: true,
                message: "Media approved successfully",
                media
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Approve Media Error:", error);
        return NextResponse.json(
            { 
                success: false,
                message: "Internal Server Error",
                error: error.message 
            },
            { status: 500 }
        );
    }
}// //  APPROVE MEDIA
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { getAdmin } from "@/utils/getAdmin.js";
// import Media from "@/models/mediaModel.js";
// import District from "@/models/districtModel.js";
// import GramPanchayat from "@/models/panchayatModel.js";
// import Admin from "@/models/adminModel.js";
// import mongoose from "mongoose";

// connectDB();

// export async function PUT(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can approve media." 
//                 },
//                 { status: 403 }
//             );
//         }

//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid media ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF MEDIA EXISTS
//         const media = await Media.findById(id);
//         if (!media) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Media not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // CHECK IF ALREADY APPROVED
//         if (media.status === 'approved') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Media is already approved" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // APPROVE MEDIA
//         media.status = 'approved';
//         await media.save();

//         // POPULATE RELATIONS
//         await media.populate('district', 'name slug');
//         await media.populate('gramPanchayat', 'name slug');
//         await media.populate('uploadedBy', 'name email');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Media approved successfully",
//                 media
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Approve Media Error:", error);
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