// GET PANCHAYATS BY BLOCK
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import GramPanchayat from "@/models/panchayatModel.js";
import District from "@/models/districtModel";
import Admin from "@/models/adminModel";
connectDB();

export async function GET(request, context) {
    try {
        const { params } = await context;
        const { blockName } = await params;

        // DECODE URL ENCODED BLOCK NAME
        const decodedBlockName = decodeURIComponent(blockName);

        // FETCH PANCHAYATS BY BLOCK
        const panchayats = await GramPanchayat.find({ 
            block: { $regex: decodedBlockName, $options: 'i' }
        })
        .select('name slug district block coordinates status population')
        .populate('district', 'name slug')
        .populate('createdBy', 'name email role')
        .sort({ name: 1 });

        return NextResponse.json(
            { 
                success: true,
                count: panchayats.length,
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