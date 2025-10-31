// CREATE & GET ALL DISTRICTS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import District from "@/models/districtModel.js";

connectDB();

// CREATE NEW DISTRICT
export async function POST(request) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can create districts." 
                },
                { status: 403 }
            );
        }

        const districtData = await request.json();
        const { 
            name, 
            slug, 
            headerImage, 
            formationYear,
            administrativeDivisions,
            politicalConstituencies,
            area,
            population,
            coordinates,
            majorRivers,
            hills,
            naturalSpots,
            historyAndCulture,
            touristPlaces,
            famousPersonalities,
            status
        } = districtData;

        // VALIDATE REQUIRED FIELDS
        if (!name || !slug || !headerImage || !coordinates) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide required fields: name, slug, headerImage, coordinates" 
                },
                { status: 400 }
            );
        }

        // VALIDATE COORDINATES
        if (!coordinates.lat || !coordinates.lng) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide valid coordinates (lat, lng)" 
                },
                { status: 400 }
            );
        }

        // CHECK IF DISTRICT WITH SLUG ALREADY EXISTS
        const existingDistrict = await District.findOne({ 
            $or: [
                { slug: slug.toLowerCase() },
                { name: name }
            ]
        });

        if (existingDistrict) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "District with this name or slug already exists" 
                },
                { status: 409 }
            );
        }

        // CREATE DISTRICT
        const district = await District.create({
            name,
            slug: slug.toLowerCase(),
            headerImage,
            formationYear,
            administrativeDivisions,
            politicalConstituencies,
            area,
            population,
            coordinates,
            majorRivers,
            hills,
            naturalSpots,
            historyAndCulture,
            touristPlaces,
            famousPersonalities,
            status: status || 'active',
            createdBy: currentAdmin._id
        });

        return NextResponse.json(
            { 
                success: true,
                message: "District created successfully",
                district
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create District Error:", error);
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

// GET ALL DISTRICTS
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // QUERY PARAMETERS
        const status = searchParams.get('status'); // Filter by status
        const search = searchParams.get('search'); // Search by name
        const sort = searchParams.get('sort') || 'name'; // Sort field
        const order = searchParams.get('order') || 'asc'; // Sort order
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 100;

        // BUILD QUERY
        let query = {};
        
        if (status && ['active', 'draft'].includes(status)) {
            query.status = status;
        } else {
            query.status = 'active'; // Default show only active
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        // BUILD SORT
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sort]: sortOrder };

        // CALCULATE PAGINATION
        const skip = (page - 1) * limit;

        // FETCH DISTRICTS
        const districts = await District.find(query)
            .select('name slug headerImage formationYear area population coordinates status createdAt')
            .populate('createdBy', 'name email')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        // GET TOTAL COUNT
        const totalDistricts = await District.countDocuments(query);
        const totalPages = Math.ceil(totalDistricts / limit);

        return NextResponse.json(
            { 
                success: true,
                count: districts.length,
                totalDistricts,
                currentPage: page,
                totalPages,
                districts
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get All Districts Error:", error);
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