// GET PANCHAYATS BY DISTRICT

import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import District from "@/models/districtModel.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel";

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
        const status = searchParams.get('status');
        const block = searchParams.get('block');

        // BUILD QUERY
        let query = { district: districtId };
        
        if (status && ['verified', 'pending', 'draft'].includes(status)) {
            query.status = status;
        }
        
        if (block) {
            query.block = { $regex: block, $options: 'i' };
        }

        // FETCH PANCHAYATS
        const panchayats = await GramPanchayat.find(query)
            .select('name slug block coordinates status population createdAt')
            .populate('createdBy', 'name email role')
            .sort({ name: 1 });

        return NextResponse.json(
            { 
                success: true,
                count: panchayats.length,
                district: {
                    id: district._id,
                    name: district.name,
                    slug: district.slug
                },
                panchayats
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Panchayats by District Error:", error);
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