// SEARCH PANCHAYATS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import District from "@/models/districtModel.js";
import GramPanchayat from "@/models/panchayatModel.js";

connectDB();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const districtFilter = searchParams.get('district');
        const limit = parseInt(searchParams.get('limit')) || 20;

        if (!query || query.trim().length < 2) {
            return NextResponse.json(
                { success: false, message: "Search query must be at least 2 characters" },
                { status: 400 }
            );
        }

        let searchQuery = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { slug: { $regex: query, $options: 'i' } },
                { block: { $regex: query, $options: 'i' } }
            ]
        };

        if (districtFilter) {
            const district = await District.findOne({ 
                $or: [
                    { name: { $regex: districtFilter, $options: 'i' } },
                    { slug: districtFilter.toLowerCase() }
                ]
            });

            if (district) {
                searchQuery.district = district._id;
            }
        }

        const panchayats = await GramPanchayat.find(searchQuery)
            .select('name slug district block coordinates basicInfo.population basicInfo.area headerImage status')
            .populate('district', 'name slug')
            .limit(limit)
            .sort({ name: 1 });

        return NextResponse.json(
            { success: true, count: panchayats.length, query: query, panchayats },
            { status: 200 }
        );

    } catch (error) {
        console.error("Search Panchayats Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const query = searchParams.get('q'); // Search query
//         const districtFilter = searchParams.get('district'); // Filter by district name
//         const limit = parseInt(searchParams.get('limit')) || 20;

//         if (!query || query.trim().length < 2) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Search query must be at least 2 characters" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // BUILD SEARCH QUERY
//         let searchQuery = {
//             $or: [
//                 { name: { $regex: query, $options: 'i' } },
//                 { slug: { $regex: query, $options: 'i' } },
//                 { block: { $regex: query, $options: 'i' } }
//             ]
//         };

//         // IF DISTRICT FILTER PROVIDED, GET DISTRICT ID FIRST
//         if (districtFilter) {
//             const district = await District.findOne({ 
//                 $or: [
//                     { name: { $regex: districtFilter, $options: 'i' } },
//                     { slug: districtFilter.toLowerCase() }
//                 ]
//             });

//             if (district) {
//                 searchQuery.district = district._id;
//             }
//         }

//         // SEARCH PANCHAYATS
//         const panchayats = await GramPanchayat.find(searchQuery)
//             .select('name slug district block coordinates population area headerImage status')
//             .populate('district', 'name slug')
//             .limit(limit)
//             .sort({ name: 1 });

//         return NextResponse.json(
//             { 
//                 success: true,
//                 count: panchayats.length,
//                 query: query,
//                 panchayats
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Search Panchayats Error:", error);
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

// // SEARCH PANCHAYATS
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import District from "@/models/districtModel.js";
// import GramPanchayat from "@/models/panchayatModel";

// connectDB();

// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
//         const query = searchParams.get('q'); // Search query
//         const districtFilter = searchParams.get('district'); // Filter by district name
//         const limit = parseInt(searchParams.get('limit')) || 20;

//         if (!query || query.trim().length < 2) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Search query must be at least 2 characters" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // BUILD SEARCH QUERY
//         let searchQuery = {
//             $or: [
//                 { name: { $regex: query, $options: 'i' } },
//                 { slug: { $regex: query, $options: 'i' } },
//                 { block: { $regex: query, $options: 'i' } }
//             ]
//         };

//         // IF DISTRICT FILTER PROVIDED, GET DISTRICT ID FIRST
//         if (districtFilter) {
//             const district = await District.findOne({ 
//                 $or: [
//                     { name: { $regex: districtFilter, $options: 'i' } },
//                     { slug: districtFilter.toLowerCase() }
//                 ]
//             });

//             if (district) {
//                 searchQuery.district = district._id;
//             }
//         }

//         // SEARCH PANCHAYATS
//         const panchayats = await GramPanchayat.find(searchQuery)
//             .select('name slug district block coordinates population')
//             .populate('district', 'name slug')
//             .limit(limit)
//             .sort({ name: 1 });

//         return NextResponse.json(
//             { 
//                 success: true,
//                 count: panchayats.length,
//                 query: query,
//                 panchayats
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Search Panchayats Error:", error);
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