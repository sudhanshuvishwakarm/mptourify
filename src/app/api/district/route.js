// CREATE & GET ALL DISTRICTS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import District from "@/models/districtModel.js";
import cloudinary from "@/config/cloudinary.js";

connectDB();
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
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

        // Check if request is form data (file upload) or JSON
        const contentType = request.headers.get('content-type');
        
        let districtData;
        let headerImageUrl;

        if (contentType && contentType.includes('multipart/form-data')) {
            // Handle form data with file upload
            const formData = await request.formData();
            
            // Extract file and other form data
            const file = formData.get('headerImage');
            const fileUrl = formData.get('headerImageUrl');
            const uploadMethod = formData.get('uploadMethod') || 'file';

            // Handle image upload
            if (uploadMethod === 'file' && file) {
                // VALIDATE FILE SIZE (max 50MB)
                const maxSize = 50 * 1024 * 1024;
                if (file.size > maxSize) {
                    return NextResponse.json(
                        { 
                            success: false,
                            message: "File size exceeds 50MB limit" 
                        },
                        { status: 400 }
                    );
                }

                // VALIDATE FILE TYPE
                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    return NextResponse.json(
                        { 
                            success: false,
                            message: "Please select a valid image file (JPEG, PNG, WebP)" 
                        },
                        { status: 400 }
                    );
                }

                // CONVERT FILE TO BUFFER
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // UPLOAD TO CLOUDINARY WITH DISTRICT FOLDER
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'mptourify/district',
                            resource_type: 'image',
                            transformation: [
                                { width: 1920, height: 1080, crop: 'limit' },
                                { quality: 'auto:good' }
                            ]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });

                headerImageUrl = uploadResult.secure_url;
            } else if (uploadMethod === 'url' && fileUrl) {
                // Use provided URL
                headerImageUrl = fileUrl;
            } else {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Please provide either a file or image URL" 
                    },
                    { status: 400 }
                );
            }

            // Parse other form data
            districtData = {
                name: formData.get('name'),
                slug: formData.get('slug'),
                headerImage: headerImageUrl,
                formationYear: formData.get('formationYear'),
                area: formData.get('area'),
                population: formData.get('population'),
                coordinates: {
                    lat: parseFloat(formData.get('coordinates[lat]')),
                    lng: parseFloat(formData.get('coordinates[lng]'))
                },
                status: formData.get('status') || 'active',
                // Parse array fields
                administrativeDivisions: formData.get('administrativeDivisions')?.split(',').map(item => item.trim()).filter(item => item) || [],
                politicalConstituencies: {
                    lokSabha: formData.get('politicalConstituencies[lokSabha]')?.split(',').map(item => item.trim()).filter(item => item) || [],
                    vidhanSabha: formData.get('politicalConstituencies[vidhanSabha]')?.split(',').map(item => item.trim()).filter(item => item) || []
                },
                majorRivers: formData.get('majorRivers')?.split(',').map(item => item.trim()).filter(item => item) || [],
                hills: formData.get('hills')?.split(',').map(item => item.trim()).filter(item => item) || [],
                naturalSpots: formData.get('naturalSpots')?.split(',').map(item => item.trim()).filter(item => item) || [],
                historyAndCulture: formData.get('historyAndCulture'),
                touristPlaces: JSON.parse(formData.get('touristPlaces') || '[]'),
                famousPersonalities: JSON.parse(formData.get('famousPersonalities') || '[]')
            };
        } else {
            // Handle JSON data (existing functionality)
            districtData = await request.json();
        }

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
            administrativeDivisions: administrativeDivisions || [],
            politicalConstituencies: politicalConstituencies || { lokSabha: [], vidhanSabha: [] },
            area,
            population,
            coordinates,
            majorRivers: majorRivers || [],
            hills: hills || [],
            naturalSpots: naturalSpots || [],
            historyAndCulture,
            touristPlaces: touristPlaces || [],
            famousPersonalities: famousPersonalities || [],
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
        
        // Only filter by status if it's provided and valid
        if (status && ['active', 'draft'].includes(status)) {
            query.status = status;
        }
        // If status is empty or invalid, don't add status filter (show all)
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } }
            ];
        }

        // BUILD SORT - Active districts first, then drafts
        let sortObj = {};
        
        if (sort === 'name') {
            // If sorting by name, use custom sort for status first, then name
            sortObj = { 
                status: 1, // 'active' comes before 'draft' (descending: active=1, draft=-1)
                name: order === 'desc' ? -1 : 1 
            };
        } else if (sort === 'status') {
            // If explicitly sorting by status, show active first
            sortObj = { status: -1 };
        } else {
            // For any other sort field, still show active districts first
            sortObj = { 
                status: -1, // Active first
                [sort]: order === 'desc' ? -1 : 1 
            };
        }

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

// // CREATE & GET ALL DISTRICTS
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { isAdmin } from "@/utils/getAdmin.js";
// import District from "@/models/districtModel.js";

// connectDB();

// // CREATE NEW DISTRICT
// export async function POST(request) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can create districts." 
//                 },
//                 { status: 403 }
//             );
//         }

//         const districtData = await request.json();
//         const { 
//             name, 
//             slug, 
//             headerImage, 
//             formationYear,
//             administrativeDivisions,
//             politicalConstituencies,
//             area,
//             population,
//             coordinates,
//             majorRivers,
//             hills,
//             naturalSpots,
//             historyAndCulture,
//             touristPlaces,
//             famousPersonalities,
//             status
//         } = districtData;

//         // VALIDATE REQUIRED FIELDS
//         if (!name || !slug || !headerImage || !coordinates) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Please provide required fields: name, slug, headerImage, coordinates" 
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

//         // CHECK IF DISTRICT WITH SLUG ALREADY EXISTS
//         const existingDistrict = await District.findOne({ 
//             $or: [
//                 { slug: slug.toLowerCase() },
//                 { name: name }
//             ]
//         });

//         if (existingDistrict) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "District with this name or slug already exists" 
//                 },
//                 { status: 409 }
//             );
//         }

//         // CREATE DISTRICT
//         const district = await District.create({
//             name,
//             slug: slug.toLowerCase(),
//             headerImage,
//             formationYear,
//             administrativeDivisions,
//             politicalConstituencies,
//             area,
//             population,
//             coordinates,
//             majorRivers,
//             hills,
//             naturalSpots,
//             historyAndCulture,
//             touristPlaces,
//             famousPersonalities,
//             status: status || 'active',
//             createdBy: currentAdmin._id
//         });

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "District created successfully",
//                 district
//             },
//             { status: 201 }
//         );

//     } catch (error) {
//         console.error("Create District Error:", error);
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

// // GET ALL DISTRICTS
// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
        
//         // QUERY PARAMETERS
//         const status = searchParams.get('status'); // Filter by status
//         const search = searchParams.get('search'); // Search by name
//         const sort = searchParams.get('sort') || 'name'; // Sort field
//         const order = searchParams.get('order') || 'asc'; // Sort order
//         const page = parseInt(searchParams.get('page')) || 1;
//         const limit = parseInt(searchParams.get('limit')) || 100;

//         // BUILD QUERY
//         let query = {};
        
//         // Only filter by status if it's provided and valid
//         if (status && ['active', 'draft'].includes(status)) {
//             query.status = status;
//         }
//         // If status is empty or invalid, don't add status filter (show all)
        
//         if (search) {
//             query.$or = [
//                 { name: { $regex: search, $options: 'i' } },
//                 { slug: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // BUILD SORT - Active districts first, then drafts
//         let sortObj = {};
        
//         if (sort === 'name') {
//             // If sorting by name, use custom sort for status first, then name
//             sortObj = { 
//                 status: 1, // 'active' comes before 'draft' (descending: active=1, draft=-1)
//                 name: order === 'desc' ? -1 : 1 
//             };
//         } else if (sort === 'status') {
//             // If explicitly sorting by status, show active first
//             sortObj = { status: -1 };
//         } else {
//             // For any other sort field, still show active districts first
//             sortObj = { 
//                 status: -1, // Active first
//                 [sort]: order === 'desc' ? -1 : 1 
//             };
//         }

//         // CALCULATE PAGINATION
//         const skip = (page - 1) * limit;

//         // FETCH DISTRICTS
//         const districts = await District.find(query)
//             .select('name slug headerImage formationYear area population coordinates status createdAt')
//             .populate('createdBy', 'name email')
//             .sort(sortObj)
//             .skip(skip)
//             .limit(limit);

//         // GET TOTAL COUNT
//         const totalDistricts = await District.countDocuments(query);
//         const totalPages = Math.ceil(totalDistricts / limit);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 count: districts.length,
//                 totalDistricts,
//                 currentPage: page,
//                 totalPages,
//                 districts
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get All Districts Error:", error);
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