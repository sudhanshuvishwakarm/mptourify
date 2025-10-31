// GET DISTRICTS FOR MAP (Coordinates)

import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import District from "@/models/districtModel.js";

connectDB();

export async function GET(request) {
    try {
        // FETCH ALL ACTIVE DISTRICTS WITH MINIMAL DATA FOR MAP
        const districts = await District.find({ status: 'active' })
            .select('name slug coordinates headerImage area population')
            .sort({ name: 1 });

        // FORMAT FOR MAP
        const mapData = districts.map(district => ({
            id: district._id,
            name: district.name,
            slug: district.slug,
            lat: district.coordinates.lat,
            lng: district.coordinates.lng,
            headerImage: district.headerImage,
            area: district.area,
            population: district.population
        }));

        return NextResponse.json(
            { 
                success: true,
                count: mapData.length,
                districts: mapData
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Map Coordinates Error:", error);
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