// GET PANCHAYATS BY BLOCK
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import GramPanchayat from "@/models/panchayatModel.js";

connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { blockName } = await params;

        // DECODE URL ENCODED BLOCK NAME
        const decodedBlockName = decodeURIComponent(blockName);

        // GET QUERY PARAMETERS
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;

        // BUILD QUERY
        let query = { 
            block: { $regex: decodedBlockName, $options: 'i' }
        };
        
        if (status && ['verified', 'pending', 'draft'].includes(status)) {
            query.status = status;
        }

        // CALCULATE PAGINATION
        const skip = (page - 1) * limit;

        // FETCH PANCHAYATS BY BLOCK
        const panchayats = await GramPanchayat.find(query)
            .select('name slug district block coordinates status population area headerImage createdAt')
            .populate('district', 'name slug')
            .populate('createdBy', 'name email role')
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        // GET TOTAL COUNT
        const totalPanchayats = await GramPanchayat.countDocuments(query);
        const totalPages = Math.ceil(totalPanchayats / limit);

        return NextResponse.json(
            { 
                success: true,
                count: panchayats.length,
                totalPanchayats,
                currentPage: page,
                totalPages,
                block: decodedBlockName,
                panchayats
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Panchayats by Block Error:", error);
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


// // GET PANCHAYATS BY BLOCK
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import GramPanchayat from "@/models/panchayatModel.js";
// import District from "@/models/districtModel";
// import Admin from "@/models/adminModel";
// connectDB();

// export async function GET(request, context) {
//     try {
//         const { params } = await context;
//         const { blockName } = await params;

//         // DECODE URL ENCODED BLOCK NAME
//         const decodedBlockName = decodeURIComponent(blockName);

//         // FETCH PANCHAYATS BY BLOCK
//         const panchayats = await GramPanchayat.find({ 
//             block: { $regex: decodedBlockName, $options: 'i' }
//         })
//         .select('name slug district block coordinates status population')
//         .populate('district', 'name slug')
//         .populate('createdBy', 'name email role')
//         .sort({ name: 1 });

//         return NextResponse.json(
//             { 
//                 success: true,
//                 count: panchayats.length,
//                 block: decodedBlockName,
//                 panchayats
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get Panchayats by Block Error:", error);
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