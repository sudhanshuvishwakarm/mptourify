import { NextResponse } from "next/server";
import District from "@/models/districtModel.js";
import Media from "@/models/mediaModel";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { checkRole, getAdmin } from "@/utils/getAdmin.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel.js";

connectDB();

export async function POST(request) {
    try {
        const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

        if (!hasAccess) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins and RTCs can create panchayats." 
                },
                { status: 403 }
            );
        }

        const panchayatData = await request.json();
        const { 
            name,
            slug,
            district,
            block,
            coordinates,
            establishmentYear,
            historicalBackground,
            population,
            localArt,
            localCuisine,
            traditions,
            photoGallery,
            videoGallery,
            status
        } = panchayatData;

        if (!name || !slug || !district || !block || !coordinates) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide required fields: name, slug, district, block, coordinates" 
                },
                { status: 400 }
            );
        }

        if (!coordinates.lat || !coordinates.lng) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide valid coordinates (lat, lng)" 
                },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(district)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid district ID" 
                },
                { status: 400 }
            );
        }

        const districtExists = await District.findById(district);
        if (!districtExists) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "District not found" 
                },
                { status: 404 }
            );
        }

        if (currentAdmin.role === 'rtc') {
            const hasDistrictAccess = currentAdmin.assignedDistricts.some(
                d => d.toString() === district
            );

            if (!hasDistrictAccess) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "You don't have access to create panchayats in this district" 
                    },
                    { status: 403 }
                );
            }
        }

        const existingPanchayat = await GramPanchayat.findOne({ 
            slug: slug.toLowerCase(),
            district: district
        });

        if (existingPanchayat) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Panchayat with this slug already exists in this district" 
                },
                { status: 409 }
            );
        }

        // TEMPORARY FIX: Handle localCuisine properly
        const cleanPanchayatData = {
            name,
            slug: slug.toLowerCase(),
            district,
            block,
            coordinates: {
                lat: parseFloat(coordinates.lat),
                lng: parseFloat(coordinates.lng)
            },
            establishmentYear: establishmentYear ? parseInt(establishmentYear) : undefined,
            historicalBackground,
            population: population ? parseInt(population) : undefined,
            localArt,
            traditions,
            photoGallery: photoGallery || [],
            videoGallery: videoGallery || [],
            status: status || 'pending',
            createdBy: currentAdmin._id
        };

        // Only add localCuisine if it's a string, not an object
        if (typeof localCuisine === 'string') {
            cleanPanchayatData.localCuisine = localCuisine;
        } else if (localCuisine && typeof localCuisine === 'object') {
            // If it comes as object, convert to string
            cleanPanchayatData.localCuisine = localCuisine.description || localCuisine.name || JSON.stringify(localCuisine);
        }

        const panchayat = await GramPanchayat.create(cleanPanchayatData);

        await panchayat.populate('district', 'name slug');
        await panchayat.populate('createdBy', 'name email role');
        await panchayat.populate('photoGallery');
        await panchayat.populate('videoGallery');

        return NextResponse.json(
            { 
                success: true,
                message: "Gram Panchayat created successfully",
                panchayat
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create Panchayat Error:", error);
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
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // QUERY PARAMETERS
        const district = searchParams.get('district'); // Filter by district ID
        const block = searchParams.get('block'); // Filter by block name
        const status = searchParams.get('status'); // Filter by status
        const search = searchParams.get('search'); // Search by name
        const sort = searchParams.get('sort') || 'name'; // Sort field
        const order = searchParams.get('order') || 'asc'; // Sort order
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;

        // BUILD QUERY
        let query = {};
        
        if (district && mongoose.Types.ObjectId.isValid(district)) {
            query.district = district;
        }
        
        if (block) {
            query.block = { $regex: block, $options: 'i' };
        }
        
        if (status && ['verified', 'pending', 'draft'].includes(status)) {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { block: { $regex: search, $options: 'i' } }
            ];
        }

        // BUILD SORT
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sort]: sortOrder };

        // CALCULATE PAGINATION
        const skip = (page - 1) * limit;

        // FETCH PANCHAYATS
        const panchayats = await GramPanchayat.find(query)
            .select('name slug district block coordinates status population createdAt')
            .populate('district', 'name slug')
            .populate('createdBy', 'name email role')
            .sort(sortObj)
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
                panchayats
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get All Panchayats Error:", error);
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


// // CREATE & GET ALL PANCHAYATS

// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { checkRole, getAdmin } from "@/utils/getAdmin.js";
// import District from "@/models/districtModel.js";
// import mongoose from "mongoose";
// import GramPanchayat from "@/models/panchayatModel.js";
// import Media from "@/models/mediaModel.js";


// connectDB();

// // CREATE NEW PANCHAYAT
// export async function POST(request) {
//     try {
//         // CHECK IF USER HAS ACCESS (ADMIN OR RTC)
//         const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

//         if (!hasAccess) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins and RTCs can create panchayats." 
//                 },
//                 { status: 403 }
//             );
//         }

//         const panchayatData = await request.json();
//         const { 
//             name,
//             slug,
//             district,
//             block,
//             coordinates,
//             establishmentYear,
//             historicalBackground,
//             population,
//             // religiousPlaces,
//             // waterBodies,
//             localArt,
//             localCuisine,
//             traditions,
//             photoGallery,
//             videoGallery,
//             status
//         } = panchayatData;

//         // VALIDATE REQUIRED FIELDS
//         if (!name || !slug || !district || !block || !coordinates) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Please provide required fields: name, slug, district, block, coordinates" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE COORDINATES
//         if (!coordinates.lat || !coordinates.lng) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Please provide valid coordinates (lat, lng)" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE MONGODB DISTRICT ID
//         if (!mongoose.Types.ObjectId.isValid(district)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid district ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF DISTRICT EXISTS
//         const districtExists = await District.findById(district);
//         if (!districtExists) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "District not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // IF RTC, CHECK IF DISTRICT IS IN THEIR ASSIGNED DISTRICTS
//         if (currentAdmin.role === 'rtc') {
//             const hasDistrictAccess = currentAdmin.assignedDistricts.some(
//                 d => d.toString() === district
//             );

//             if (!hasDistrictAccess) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "You don't have access to create panchayats in this district" 
//                     },
//                     { status: 403 }
//                 );
//             }
//         }

//         // CHECK IF PANCHAYAT WITH SLUG ALREADY EXISTS IN SAME DISTRICT
//         const existingPanchayat = await GramPanchayat.findOne({ 
//             slug: slug.toLowerCase(),
//             district: district
//         });

//         if (existingPanchayat) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Panchayat with this slug already exists in this district" 
//                 },
//                 { status: 409 }
//             );
//         }

//         // VALIDATE MEDIA IDs IF PROVIDED
//         if (photoGallery && photoGallery.length > 0) {
//             const validPhotos = photoGallery.every(id => mongoose.Types.ObjectId.isValid(id));
//             if (!validPhotos) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid media IDs in photoGallery" 
//                     },
//                     { status: 400 }
//                 );
//             }
//         }

//         if (videoGallery && videoGallery.length > 0) {
//             const validVideos = videoGallery.every(id => mongoose.Types.ObjectId.isValid(id));
//             if (!validVideos) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid media IDs in videoGallery" 
//                     },
//                     { status: 400 }
//                 );
//             }
//         }

//         // CREATE PANCHAYAT
//         const panchayat = await GramPanchayat.create({
//             name,
//             slug: slug.toLowerCase(),
//             district,
//             block,
//             coordinates,
//             establishmentYear,
//             historicalBackground,
//             population,
//             // religiousPlaces,
//             // waterBodies,
//             localArt,
//             localCuisine,
//             traditions,
//             photoGallery: photoGallery || [],
//             videoGallery: videoGallery || [],
//             status: status || 'pending',
//             createdBy: currentAdmin._id
//         });

//         // POPULATE RELATIONS
//         await panchayat.populate('district', 'name slug');
//         await panchayat.populate('createdBy', 'name email role');
//         await panchayat.populate('photoGallery');
//         await panchayat.populate('videoGallery');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Gram Panchayat created successfully",
//                 panchayat
//             },
//             { status: 201 }
//         );

//     } catch (error) {
//         console.error("Create Panchayat Error:", error);
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

// // GET ALL PANCHAYATS WITH FILTERS
// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
        
//         // QUERY PARAMETERS
//         const district = searchParams.get('district'); // Filter by district ID
//         const block = searchParams.get('block'); // Filter by block name
//         const status = searchParams.get('status'); // Filter by status
//         const search = searchParams.get('search'); // Search by name
//         const sort = searchParams.get('sort') || 'name'; // Sort field
//         const order = searchParams.get('order') || 'asc'; // Sort order
//         const page = parseInt(searchParams.get('page')) || 1;
//         const limit = parseInt(searchParams.get('limit')) || 50;

//         // BUILD QUERY
//         let query = {};
        
//         if (district && mongoose.Types.ObjectId.isValid(district)) {
//             query.district = district;
//         }
        
//         if (block) {
//             query.block = { $regex: block, $options: 'i' };
//         }
        
//         if (status && ['verified', 'pending', 'draft'].includes(status)) {
//             query.status = status;
//         }
        
//         if (search) {
//             query.$or = [
//                 { name: { $regex: search, $options: 'i' } },
//                 { slug: { $regex: search, $options: 'i' } },
//                 { block: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // BUILD SORT
//         const sortOrder = order === 'desc' ? -1 : 1;
//         const sortObj = { [sort]: sortOrder };

//         // CALCULATE PAGINATION
//         const skip = (page - 1) * limit;

//         // FETCH PANCHAYATS
//         const panchayats = await GramPanchayat.find(query)
//             .select('name slug district block coordinates status population createdAt')
//             .populate('district', 'name slug')
//             .populate('createdBy', 'name email role')
//             .sort(sortObj)
//             .skip(skip)
//             .limit(limit);

//         // GET TOTAL COUNT
//         const totalPanchayats = await GramPanchayat.countDocuments(query);
//         const totalPages = Math.ceil(totalPanchayats / limit);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 count: panchayats.length,
//                 totalPanchayats,
//                 currentPage: page,
//                 totalPages,
//                 panchayats
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get All Panchayats Error:", error);
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