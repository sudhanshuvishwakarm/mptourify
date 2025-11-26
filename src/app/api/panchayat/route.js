import { NextResponse } from "next/server";
import District from "@/models/districtModel.js";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { checkRole } from "@/utils/getAdmin.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel.js";
import cloudinary from "@/config/cloudinary.js";

connectDB();
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
    try {
        console.log('=== POST REQUEST STARTED ===');
        
        const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

        if (!hasAccess) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Only admins and RTCs can create panchayats." },
                { status: 403 }
            );
        }

        const contentType = request.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        let panchayatData;
        let headerImageUrl;

        if (contentType && contentType.includes('multipart/form-data')) {
            console.log('Processing FormData...');
            const formData = await request.formData();
            
            const file = formData.get('headerImage');
            const uploadMethod = formData.get('uploadMethod') || 'file';
            console.log('Upload Method:', uploadMethod);

            if (uploadMethod === 'file' && file) {
                console.log('Uploading file to Cloudinary...');
                const maxSize = 95 * 1024 * 1024;
                if (file.size > maxSize) {
                    return NextResponse.json(
                        { success: false, message: "File size exceeds 95MB limit" },
                        { status: 400 }
                    );
                }

                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    return NextResponse.json(
                        { success: false, message: "Please select a valid image file (JPEG, PNG, WebP)" },
                        { status: 400 }
                    );
                }

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'mptourify/panchayat',
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
                console.log('Image uploaded successfully:', headerImageUrl);
            } else if (uploadMethod === 'url') {
                headerImageUrl = formData.get('headerImage');
                console.log('Using URL for header image:', headerImageUrl);
            } else {
                return NextResponse.json(
                    { success: false, message: "Please provide either a file or image URL" },
                    { status: 400 }
                );
            }

            // Parse basic info
            const basicInfo = {};
            if (formData.get('basicInfo[establishmentYear]')) {
                basicInfo.establishmentYear = parseInt(formData.get('basicInfo[establishmentYear]'));
            }
            if (formData.get('basicInfo[population]')) {
                basicInfo.population = parseInt(formData.get('basicInfo[population]'));
            }
            if (formData.get('basicInfo[area]')) {
                basicInfo.area = parseFloat(formData.get('basicInfo[area]'));
            }
            
            const majorRiversStr = formData.get('basicInfo[majorRivers]');
            if (majorRiversStr) {
                basicInfo.majorRivers = majorRiversStr.split(',').map(item => item.trim()).filter(item => item);
            } else {
                basicInfo.majorRivers = [];
            }

            const languagesSpokenStr = formData.get('basicInfo[languagesSpoken]');
            if (languagesSpokenStr) {
                basicInfo.languagesSpoken = languagesSpokenStr.split(',').map(item => item.trim()).filter(item => item);
            } else {
                basicInfo.languagesSpoken = [];
            }

            console.log('Parsed basicInfo:', basicInfo);

            // Parse cultural info
            const culturalInfo = {};
            if (formData.get('culturalInfo[historicalBackground]')) {
                culturalInfo.historicalBackground = formData.get('culturalInfo[historicalBackground]');
            }
            if (formData.get('culturalInfo[traditions]')) {
                culturalInfo.traditions = formData.get('culturalInfo[traditions]');
            }
            if (formData.get('culturalInfo[localCuisine]')) {
                culturalInfo.localCuisine = formData.get('culturalInfo[localCuisine]');
            }
            if (formData.get('culturalInfo[localArt]')) {
                culturalInfo.localArt = formData.get('culturalInfo[localArt]');
            }

            console.log('Parsed culturalInfo:', culturalInfo);

            // Parse arrays (politicalOverview, transportationServices, etc.)
            const politicalOverview = [];
            const politicalOverviewStr = formData.get('politicalOverview');
            if (politicalOverviewStr) {
                try {
                    const parsed = JSON.parse(politicalOverviewStr);
                    politicalOverview.push(...parsed);
                    console.log('Parsed politicalOverview:', politicalOverview);
                } catch (e) {
                    console.error('Error parsing politicalOverview:', e);
                }
            }

            const transportationServices = [];
            const transportationStr = formData.get('transportationServices');
            if (transportationStr) {
                try {
                    const parsed = JSON.parse(transportationStr);
                    transportationServices.push(...parsed);
                    console.log('Parsed transportationServices:', transportationServices);
                } catch (e) {
                    console.error('Error parsing transportationServices:', e);
                }
            }

            const hospitalityServices = [];
            const hospitalityStr = formData.get('hospitalityServices');
            if (hospitalityStr) {
                try {
                    const parsed = JSON.parse(hospitalityStr);
                    hospitalityServices.push(...parsed);
                    console.log('Parsed hospitalityServices:', hospitalityServices);
                } catch (e) {
                    console.error('Error parsing hospitalityServices:', e);
                }
            }

            const emergencyDirectory = [];
            const emergencyStr = formData.get('emergencyDirectory');
            if (emergencyStr) {
                try {
                    const parsed = JSON.parse(emergencyStr);
                    emergencyDirectory.push(...parsed);
                    console.log('Parsed emergencyDirectory:', emergencyDirectory);
                } catch (e) {
                    console.error('Error parsing emergencyDirectory:', e);
                }
            }

            const specialPersons = [];
            const specialPersonsStr = formData.get('specialPersons');
            if (specialPersonsStr) {
                try {
                    const parsed = JSON.parse(specialPersonsStr);
                    specialPersons.push(...parsed);
                    console.log('Parsed specialPersons:', specialPersons);
                } catch (e) {
                    console.error('Error parsing specialPersons:', e);
                }
            }

            panchayatData = {
                name: formData.get('name'),
                slug: formData.get('slug'),
                headerImage: headerImageUrl,
                district: formData.get('district'),
                block: formData.get('block'),
                coordinates: {
                    lat: parseFloat(formData.get('coordinates[lat]')),
                    lng: parseFloat(formData.get('coordinates[lng]'))
                },
                basicInfo,
                culturalInfo,
                politicalOverview,
                transportationServices,
                hospitalityServices,
                emergencyDirectory,
                specialPersons,
                status: formData.get('status') || 'Pending',
                mediaGallery: []
            };
        } else {
            console.log('Processing JSON data...');
            panchayatData = await request.json();
        }

        console.log('Final panchayatData:', JSON.stringify(panchayatData, null, 2));

        const { 
            name, slug, headerImage, district, block, coordinates,
            basicInfo, culturalInfo, politicalOverview, transportationServices,
            hospitalityServices, emergencyDirectory, specialPersons,
            mediaGallery, status
        } = panchayatData;

        // Validate required fields
        if (!name || !slug || !headerImage || !district || !block || !coordinates) {
            return NextResponse.json(
                { success: false, message: "Please provide required fields: name, slug, headerImage, district, block, coordinates" },
                { status: 400 }
            );
        }

        if (!coordinates.lat || !coordinates.lng) {
            return NextResponse.json(
                { success: false, message: "Please provide valid coordinates (lat, lng)" },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(district)) {
            return NextResponse.json(
                { success: false, message: "Invalid district ID" },
                { status: 400 }
            );
        }

        const districtExists = await District.findById(district);
        if (!districtExists) {
            return NextResponse.json(
                { success: false, message: "District not found" },
                { status: 404 }
            );
        }

        // Check RTC district access
        if (currentAdmin.role === 'rtc') {
            const hasDistrictAccess = currentAdmin.assignedDistricts.some(
                d => d.toString() === district
            );

            if (!hasDistrictAccess) {
                return NextResponse.json(
                    { success: false, message: "You don't have access to create panchayats in this district" },
                    { status: 403 }
                );
            }
        }

        // Check for duplicate slug
        const existingPanchayat = await GramPanchayat.findOne({ 
            slug: slug.toLowerCase(),
            district: district
        });

        if (existingPanchayat) {
            return NextResponse.json(
                { success: false, message: "Panchayat with this slug already exists in this district" },
                { status: 409 }
            );
        }

        // Validate politicalOverview headings
        if (politicalOverview && politicalOverview.length > 0) {
            const validHeadings = [
                'Current Leadership', 'Political History', 'Governing Structure',
                'Major Achievements', 'Recent Developments', 'Election History',
                'Administrative Setup', 'Future Plans', 'Public Participation', 'Key Challenges'
            ];
            
            const invalidHeadings = politicalOverview.filter(item => !validHeadings.includes(item.heading));
            if (invalidHeadings.length > 0) {
                return NextResponse.json(
                    { success: false, message: `Invalid political overview headings: ${invalidHeadings.map(i => i.heading).join(', ')}` },
                    { status: 400 }
                );
            }
        }

        console.log('Creating panchayat in database...');

        // Create panchayat
        const panchayat = await GramPanchayat.create({
            name,
            slug: slug.toLowerCase(),
            headerImage,
            district,
            block,
            coordinates: {
                lat: parseFloat(coordinates.lat),
                lng: parseFloat(coordinates.lng)
            },
            basicInfo: basicInfo || {},
            culturalInfo: culturalInfo || {},
            politicalOverview: politicalOverview || [],
            transportationServices: transportationServices || [],
            hospitalityServices: hospitalityServices || [],
            emergencyDirectory: emergencyDirectory || [],
            specialPersons: specialPersons || [],
            mediaGallery: mediaGallery || [],
            status: status || 'Pending',
            createdBy: currentAdmin._id
        });

        console.log('Panchayat created successfully:', panchayat._id);

        await panchayat.populate('district', 'name slug');
        await panchayat.populate('createdBy', 'name email role');
        await panchayat.populate('mediaGallery');

        console.log('=== POST REQUEST COMPLETED ===');

        return NextResponse.json(
            { success: true, message: "Gram Panchayat created successfully", panchayat },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create Panchayat Error:", error);
        console.error("Error Stack:", error.stack);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}



export async function GET(request) {
    try {
        console.log('🔵 GET /api/panchayat - Request received');
        
        const { searchParams } = new URL(request.url);
        
        const district = searchParams.get('district');
        const block = searchParams.get('block');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'name';
        const order = searchParams.get('order') || 'asc';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;

        console.log('📥 Query params:', { district, block, status, search, sort, order, page, limit });

        let query = {};
        
        if (district && mongoose.Types.ObjectId.isValid(district)) {
            query.district = district;
        }
        
        if (block) {
            query.block = { $regex: block, $options: 'i' };
        }
        
        if (status && ['Verified', 'Pending', 'Draft'].includes(status)) {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { block: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sort]: sortOrder };

        const skip = (page - 1) * limit;

        // ✅ REMOVED .select() - Now fetches ALL fields
        const panchayats = await GramPanchayat.find(query)
            .populate('district', 'name slug')
            .populate('createdBy', 'name email role')
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean();

        console.log('✅ Panchayats fetched:', panchayats.length);
        
        if (panchayats.length > 0) {
            console.log('📊 Sample panchayat data:', {
                name: panchayats[0].name,
                slug: panchayats[0].slug,
                hasBasicInfo: !!panchayats[0].basicInfo,
                hasCulturalInfo: !!panchayats[0].culturalInfo,
                culturalInfoKeys: panchayats[0].culturalInfo ? Object.keys(panchayats[0].culturalInfo) : [],
                politicalOverviewCount: panchayats[0].politicalOverview?.length || 0,
                transportServicesCount: panchayats[0].transportationServices?.length || 0,
                hospitalityServicesCount: panchayats[0].hospitalityServices?.length || 0,
                emergencyDirectoryCount: panchayats[0].emergencyDirectory?.length || 0,
                specialPersonsCount: panchayats[0].specialPersons?.length || 0
            });
        }

        const totalPanchayats = await GramPanchayat.countDocuments(query);
        const totalPages = Math.ceil(totalPanchayats / limit);

        console.log('✅ Response:', { count: panchayats.length, totalPanchayats, currentPage: page, totalPages });

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
        console.error("❌ Get All Panchayats Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}


// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
        
//         const district = searchParams.get('district');
//         const block = searchParams.get('block');
//         const status = searchParams.get('status');
//         const search = searchParams.get('search');
//         const sort = searchParams.get('sort') || 'name';
//         const order = searchParams.get('order') || 'asc';
//         const page = parseInt(searchParams.get('page')) || 1;
//         const limit = parseInt(searchParams.get('limit')) || 50;

//         let query = {};
        
//         if (district && mongoose.Types.ObjectId.isValid(district)) {
//             query.district = district;
//         }
        
//         if (block) {
//             query.block = { $regex: block, $options: 'i' };
//         }
        
//         if (status && ['Verified', 'Pending', 'Draft'].includes(status)) {
//             query.status = status;
//         }
        
//         if (search) {
//             query.$or = [
//                 { name: { $regex: search, $options: 'i' } },
//                 { slug: { $regex: search, $options: 'i' } },
//                 { block: { $regex: search, $options: 'i' } }
//             ];
//         }

//         const sortOrder = order === 'desc' ? -1 : 1;
//         const sortObj = { [sort]: sortOrder };

//         const skip = (page - 1) * limit;

//         const panchayats = await GramPanchayat.find(query)
//             .select('name slug headerImage district block coordinates status basicInfo.population basicInfo.area createdAt')
//             .populate('district', 'name slug')
//             .populate('createdBy', 'name email role')
//             .sort(sortObj)
//             .skip(skip)
//             .limit(limit)
//             .lean();

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
//             { success: false, message: "Internal Server Error", error: error.message },
//             { status: 500 }
//         );
//     }
// }

















// import { NextResponse } from "next/server";
// import District from "@/models/districtModel.js";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { checkRole } from "@/utils/getAdmin.js";
// import mongoose from "mongoose";
// import GramPanchayat from "@/models/panchayatModel.js";
// import cloudinary from "@/config/cloudinary.js";

// connectDB();
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

// export async function POST(request) {
//     try {
//         const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

//         if (!hasAccess) {
//             return NextResponse.json(
//                 { success: false, message: "Unauthorized. Only admins and RTCs can create panchayats." },
//                 { status: 403 }
//             );
//         }

//         const contentType = request.headers.get('content-type');
        
//         let panchayatData;
//         let headerImageUrl;

//         if (contentType && contentType.includes('multipart/form-data')) {
//             const formData = await request.formData();
            
//             const file = formData.get('headerImage');
//             const fileUrl = formData.get('headerImageUrl');
//             const uploadMethod = formData.get('uploadMethod') || 'file';

//             if (uploadMethod === 'file' && file) {
//                 const maxSize = 95 * 1024 * 1024;
//                 if (file.size > maxSize) {
//                     return NextResponse.json(
//                         { success: false, message: "File size exceeds 95MB limit" },
//                         { status: 400 }
//                     );
//                 }

//                 const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//                 if (!validTypes.includes(file.type)) {
//                     return NextResponse.json(
//                         { success: false, message: "Please select a valid image file (JPEG, PNG, WebP)" },
//                         { status: 400 }
//                     );
//                 }

//                 const bytes = await file.arrayBuffer();
//                 const buffer = Buffer.from(bytes);

//                 const uploadResult = await new Promise((resolve, reject) => {
//                     const uploadStream = cloudinary.uploader.upload_stream(
//                         {
//                             folder: 'mptourify/panchayat',
//                             resource_type: 'image',
//                             transformation: [
//                                 { width: 1920, height: 1080, crop: 'limit' },
//                                 { quality: 'auto:good' }
//                             ]
//                         },
//                         (error, result) => {
//                             if (error) reject(error);
//                             else resolve(result);
//                         }
//                     );
//                     uploadStream.end(buffer);
//                 });

//                 headerImageUrl = uploadResult.secure_url;
//             } else if (uploadMethod === 'url' && fileUrl) {
//                 headerImageUrl = fileUrl;
//             } else {
//                 return NextResponse.json(
//                     { success: false, message: "Please provide either a file or image URL" },
//                     { status: 400 }
//                 );
//             }

//             // Parse basic info
//             const basicInfo = {};
//             if (formData.get('basicInfo[establishmentYear]')) {
//                 basicInfo.establishmentYear = parseInt(formData.get('basicInfo[establishmentYear]'));
//             }
//             if (formData.get('basicInfo[population]')) {
//                 basicInfo.population = parseInt(formData.get('basicInfo[population]'));
//             }
//             if (formData.get('basicInfo[area]')) {
//                 basicInfo.area = parseFloat(formData.get('basicInfo[area]'));
//             }
//             const majorRiversStr = formData.get('basicInfo[majorRivers]');
//             if (majorRiversStr) {
//                 basicInfo.majorRivers = majorRiversStr.split(',').map(item => item.trim()).filter(item => item);
//             }

//             // Parse cultural info
//             const culturalInfo = {};
//             if (formData.get('culturalInfo[historicalBackground]')) {
//                 culturalInfo.historicalBackground = formData.get('culturalInfo[historicalBackground]');
//             }
//             if (formData.get('culturalInfo[traditions]')) {
//                 culturalInfo.traditions = formData.get('culturalInfo[traditions]');
//             }
//             if (formData.get('culturalInfo[localCuisine]')) {
//                 culturalInfo.localCuisine = formData.get('culturalInfo[localCuisine]');
//             }
//             if (formData.get('culturalInfo[localArt]')) {
//                 culturalInfo.localArt = formData.get('culturalInfo[localArt]');
//             }

//             // Parse arrays (politicalOverview, transportationServices, etc.)
//             const politicalOverview = [];
//             const politicalOverviewStr = formData.get('politicalOverview');
//             if (politicalOverviewStr) {
//                 try {
//                     const parsed = JSON.parse(politicalOverviewStr);
//                     politicalOverview.push(...parsed);
//                 } catch (e) {
//                     console.error('Error parsing politicalOverview:', e);
//                 }
//             }

//             const transportationServices = [];
//             const transportationStr = formData.get('transportationServices');
//             if (transportationStr) {
//                 try {
//                     const parsed = JSON.parse(transportationStr);
//                     transportationServices.push(...parsed);
//                 } catch (e) {
//                     console.error('Error parsing transportationServices:', e);
//                 }
//             }

//             const hospitalityServices = [];
//             const hospitalityStr = formData.get('hospitalityServices');
//             if (hospitalityStr) {
//                 try {
//                     const parsed = JSON.parse(hospitalityStr);
//                     hospitalityServices.push(...parsed);
//                 } catch (e) {
//                     console.error('Error parsing hospitalityServices:', e);
//                 }
//             }

//             const emergencyDirectory = [];
//             const emergencyStr = formData.get('emergencyDirectory');
//             if (emergencyStr) {
//                 try {
//                     const parsed = JSON.parse(emergencyStr);
//                     emergencyDirectory.push(...parsed);
//                 } catch (e) {
//                     console.error('Error parsing emergencyDirectory:', e);
//                 }
//             }

//             const specialPersons = [];
//             const specialPersonsStr = formData.get('specialPersons');
//             if (specialPersonsStr) {
//                 try {
//                     const parsed = JSON.parse(specialPersonsStr);
//                     specialPersons.push(...parsed);
//                 } catch (e) {
//                     console.error('Error parsing specialPersons:', e);
//                 }
//             }

//             panchayatData = {
//                 name: formData.get('name'),
//                 slug: formData.get('slug'),
//                 headerImage: headerImageUrl,
//                 district: formData.get('district'),
//                 block: formData.get('block'),
//                 coordinates: {
//                     lat: parseFloat(formData.get('coordinates[lat]')),
//                     lng: parseFloat(formData.get('coordinates[lng]'))
//                 },
//                 basicInfo,
//                 culturalInfo,
//                 politicalOverview,
//                 transportationServices,
//                 hospitalityServices,
//                 emergencyDirectory,
//                 specialPersons,
//                 status: formData.get('status') || 'Pending',
//                 mediaGallery: []
//             };
//         } else {
//             panchayatData = await request.json();
//         }

//         const { 
//             name, slug, headerImage, district, block, coordinates,
//             basicInfo, culturalInfo, politicalOverview, transportationServices,
//             hospitalityServices, emergencyDirectory, specialPersons,
//             mediaGallery, status
//         } = panchayatData;

//         // Validate required fields
//         if (!name || !slug || !headerImage || !district || !block || !coordinates) {
//             return NextResponse.json(
//                 { success: false, message: "Please provide required fields: name, slug, headerImage, district, block, coordinates" },
//                 { status: 400 }
//             );
//         }

//         if (!coordinates.lat || !coordinates.lng) {
//             return NextResponse.json(
//                 { success: false, message: "Please provide valid coordinates (lat, lng)" },
//                 { status: 400 }
//             );
//         }

//         if (!mongoose.Types.ObjectId.isValid(district)) {
//             return NextResponse.json(
//                 { success: false, message: "Invalid district ID" },
//                 { status: 400 }
//             );
//         }

//         const districtExists = await District.findById(district);
//         if (!districtExists) {
//             return NextResponse.json(
//                 { success: false, message: "District not found" },
//                 { status: 404 }
//             );
//         }

//         // Check RTC district access
//         if (currentAdmin.role === 'rtc') {
//             const hasDistrictAccess = currentAdmin.assignedDistricts.some(
//                 d => d.toString() === district
//             );

//             if (!hasDistrictAccess) {
//                 return NextResponse.json(
//                     { success: false, message: "You don't have access to create panchayats in this district" },
//                     { status: 403 }
//                 );
//             }
//         }

//         // Check for duplicate slug
//         const existingPanchayat = await GramPanchayat.findOne({ 
//             slug: slug.toLowerCase(),
//             district: district
//         });

//         if (existingPanchayat) {
//             return NextResponse.json(
//                 { success: false, message: "Panchayat with this slug already exists in this district" },
//                 { status: 409 }
//             );
//         }

//         // Validate politicalOverview headings
//         if (politicalOverview && politicalOverview.length > 0) {
//             const validHeadings = [
//                 'Current Leadership', 'Political History', 'Governing Structure',
//                 'Major Achievements', 'Recent Developments', 'Election History',
//                 'Administrative Setup', 'Future Plans', 'Public Participation', 'Key Challenges'
//             ];
            
//             const invalidHeadings = politicalOverview.filter(item => !validHeadings.includes(item.heading));
//             if (invalidHeadings.length > 0) {
//                 return NextResponse.json(
//                     { success: false, message: `Invalid political overview headings: ${invalidHeadings.map(i => i.heading).join(', ')}` },
//                     { status: 400 }
//                 );
//             }
//         }

//         // Create panchayat
//         const panchayat = await GramPanchayat.create({
//             name,
//             slug: slug.toLowerCase(),
//             headerImage,
//             district,
//             block,
//             coordinates: {
//                 lat: parseFloat(coordinates.lat),
//                 lng: parseFloat(coordinates.lng)
//             },
//             basicInfo: basicInfo || {},
//             culturalInfo: culturalInfo || {},
//             politicalOverview: politicalOverview || [],
//             transportationServices: transportationServices || [],
//             hospitalityServices: hospitalityServices || [],
//             emergencyDirectory: emergencyDirectory || [],
//             specialPersons: specialPersons || [],
//             mediaGallery: mediaGallery || [],
//             status: status || 'Pending',
//             createdBy: currentAdmin._id
//         });

//         await panchayat.populate('district', 'name slug');
//         await panchayat.populate('createdBy', 'name email role');
//         await panchayat.populate('mediaGallery');

//         return NextResponse.json(
//             { success: true, message: "Gram Panchayat created successfully", panchayat },
//             { status: 201 }
//         );
//     } catch (error) {
//         console.error("Create Panchayat Error:", error);
//         return NextResponse.json(
//             { success: false, message: "Internal Server Error", error: error.message },
//             { status: 500 }
//         );
//     }
// }

// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
        
//         const district = searchParams.get('district');
//         const block = searchParams.get('block');
//         const status = searchParams.get('status');
//         const search = searchParams.get('search');
//         const sort = searchParams.get('sort') || 'name';
//         const order = searchParams.get('order') || 'asc';
//         const page = parseInt(searchParams.get('page')) || 1;
//         const limit = parseInt(searchParams.get('limit')) || 50;

//         let query = {};
        
//         if (district && mongoose.Types.ObjectId.isValid(district)) {
//             query.district = district;
//         }
        
//         if (block) {
//             query.block = { $regex: block, $options: 'i' };
//         }
        
//         if (status && ['Verified', 'Pending', 'Draft'].includes(status)) {
//             query.status = status;
//         }
        
//         if (search) {
//             query.$or = [
//                 { name: { $regex: search, $options: 'i' } },
//                 { slug: { $regex: search, $options: 'i' } },
//                 { block: { $regex: search, $options: 'i' } }
//             ];
//         }

//         const sortOrder = order === 'desc' ? -1 : 1;
//         const sortObj = { [sort]: sortOrder };

//         const skip = (page - 1) * limit;

//         const panchayats = await GramPanchayat.find(query)
//             .select('name slug headerImage district block coordinates status basicInfo.population basicInfo.area createdAt')
//             .populate('district', 'name slug')
//             .populate('createdBy', 'name email role')
//             .sort(sortObj)
//             .skip(skip)
//             .limit(limit)
//             .lean();

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
//             { success: false, message: "Internal Server Error", error: error.message },
//             { status: 500 }
//         );
//     }
// }























// import { NextResponse } from "next/server";
// import District from "@/models/districtModel.js";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { checkRole } from "@/utils/getAdmin.js";
// import mongoose from "mongoose";
// import GramPanchayat from "@/models/panchayatModel.js";
// import cloudinary from "@/config/cloudinary.js";

// connectDB();
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

// export async function POST(request) {
//     try {
//         const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

//         if (!hasAccess) {
//             return NextResponse.json(
//                 { success: false, message: "Unauthorized. Only admins and RTCs can create panchayats." },
//                 { status: 403 }
//             );
//         }

//         const contentType = request.headers.get('content-type');
        
//         let panchayatData;
//         let headerImageUrl;

//         if (contentType && contentType.includes('multipart/form-data')) {
//             const formData = await request.formData();
            
//             const file = formData.get('headerImage');
//             const fileUrl = formData.get('headerImageUrl');
//             const uploadMethod = formData.get('uploadMethod') || 'file';

//             if (uploadMethod === 'file' && file) {
//                 const maxSize = 95 * 1024 * 1024;
//                 if (file.size > maxSize) {
//                     return NextResponse.json(
//                         { success: false, message: "File size exceeds 50MB limit" },
//                         { status: 400 }
//                     );
//                 }

//                 const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//                 if (!validTypes.includes(file.type)) {
//                     return NextResponse.json(
//                         { success: false, message: "Please select a valid image file (JPEG, PNG, WebP)" },
//                         { status: 400 }
//                     );
//                 }

//                 const bytes = await file.arrayBuffer();
//                 const buffer = Buffer.from(bytes);

//                 const uploadResult = await new Promise((resolve, reject) => {
//                     const uploadStream = cloudinary.uploader.upload_stream(
//                         {
//                             folder: 'mptourify/panchayat',
//                             resource_type: 'image',
//                             transformation: [
//                                 { width: 1920, height: 1080, crop: 'limit' },
//                                 { quality: 'auto:good' }
//                             ]
//                         },
//                         (error, result) => {
//                             if (error) reject(error);
//                             else resolve(result);
//                         }
//                     );
//                     uploadStream.end(buffer);
//                 });

//                 headerImageUrl = uploadResult.secure_url;
//             } else if (uploadMethod === 'url' && fileUrl) {
//                 headerImageUrl = fileUrl;
//             } else {
//                 return NextResponse.json(
//                     { success: false, message: "Please provide either a file or image URL" },
//                     { status: 400 }
//                 );
//             }

//             panchayatData = {
//                 name: formData.get('name'),
//                 slug: formData.get('slug'),
//                 headerImage: headerImageUrl,
//                 district: formData.get('district'),
//                 block: formData.get('block'),
//                 coordinates: {
//                     lat: parseFloat(formData.get('coordinates[lat]')),
//                     lng: parseFloat(formData.get('coordinates[lng]'))
//                 },
//                 establishmentYear: formData.get('establishmentYear') ? parseInt(formData.get('establishmentYear')) : undefined,
//                 historicalBackground: formData.get('historicalBackground'),
//                 population: formData.get('population') ? parseInt(formData.get('population')) : undefined,
//                 area: formData.get('area') ? parseFloat(formData.get('area')) : undefined,
//                 localArt: formData.get('localArt'),
//                 localCuisine: formData.get('localCuisine'),
//                 traditions: formData.get('traditions'),
//                 status: formData.get('status') || 'pending',
//                 majorRivers: formData.get('majorRivers')?.split(',').map(item => item.trim()).filter(item => item) || [],
//                 mediaGallery: []
//             };
//         } else {
//             panchayatData = await request.json();
//         }

//         const { 
//             name, slug, headerImage, district, block, coordinates,
//             establishmentYear, historicalBackground, population, area,
//             localArt, localCuisine, traditions, majorRivers, mediaGallery, status
//         } = panchayatData;

//         if (!name || !slug || !headerImage || !district || !block || !coordinates) {
//             return NextResponse.json(
//                 { success: false, message: "Please provide required fields: name, slug, headerImage, district, block, coordinates" },
//                 { status: 400 }
//             );
//         }

//         if (!coordinates.lat || !coordinates.lng) {
//             return NextResponse.json(
//                 { success: false, message: "Please provide valid coordinates (lat, lng)" },
//                 { status: 400 }
//             );
//         }

//         if (!mongoose.Types.ObjectId.isValid(district)) {
//             return NextResponse.json(
//                 { success: false, message: "Invalid district ID" },
//                 { status: 400 }
//             );
//         }

//         const districtExists = await District.findById(district);
//         if (!districtExists) {
//             return NextResponse.json(
//                 { success: false, message: "District not found" },
//                 { status: 404 }
//             );
//         }

//         if (currentAdmin.role === 'rtc') {
//             const hasDistrictAccess = currentAdmin.assignedDistricts.some(
//                 d => d.toString() === district
//             );

//             if (!hasDistrictAccess) {
//                 return NextResponse.json(
//                     { success: false, message: "You don't have access to create panchayats in this district" },
//                     { status: 403 }
//                 );
//             }
//         }

//         const existingPanchayat = await GramPanchayat.findOne({ 
//             slug: slug.toLowerCase(),
//             district: district
//         });

//         if (existingPanchayat) {
//             return NextResponse.json(
//                 { success: false, message: "Panchayat with this slug already exists in this district" },
//                 { status: 409 }
//             );
//         }

//         const panchayat = await GramPanchayat.create({
//             name,
//             slug: slug.toLowerCase(),
//             headerImage,
//             district,
//             block,
//             coordinates: {
//                 lat: parseFloat(coordinates.lat),
//                 lng: parseFloat(coordinates.lng)
//             },
//             establishmentYear,
//             historicalBackground,
//             population,
//             area,
//             localArt,
//             localCuisine,
//             traditions,
//             majorRivers: majorRivers || [],
//             mediaGallery: mediaGallery || [],
//             status: status || 'pending',
//             createdBy: currentAdmin._id
//         });

//         await panchayat.populate('district', 'name slug');
//         await panchayat.populate('createdBy', 'name email role');
//         await panchayat.populate('mediaGallery');

//         return NextResponse.json(
//             { success: true, message: "Gram Panchayat created successfully", panchayat },
//             { status: 201 }
//         );
//     } catch (error) {
//         console.error("Create Panchayat Error:", error);
//         return NextResponse.json(
//             { success: false, message: "Internal Server Error", error: error.message },
//             { status: 500 }
//         );
//     }
// }

// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
        
//         const district = searchParams.get('district');
//         const block = searchParams.get('block');
//         const status = searchParams.get('status');
//         const search = searchParams.get('search');
//         const sort = searchParams.get('sort') || 'name';
//         const order = searchParams.get('order') || 'asc';
//         const page = parseInt(searchParams.get('page')) || 1;
//         const limit = parseInt(searchParams.get('limit')) || 50;

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

//         const sortOrder = order === 'desc' ? -1 : 1;
//         const sortObj = { [sort]: sortOrder };

//         const skip = (page - 1) * limit;

//         const panchayats = await GramPanchayat.find(query)
//             .select('name slug headerImage district block coordinates status population area createdAt')
//             .populate('district', 'name slug')
//             .populate('createdBy', 'name email role')
//             .sort(sortObj)
//             .skip(skip)
//             .limit(limit);

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
//             { success: false, message: "Internal Server Error", error: error.message },
//             { status: 500 }
//         );
//     }
// }
