import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { checkRole, getAdmin } from "@/utils/getAdmin.js";
import Media from "@/models/mediaModel.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel.js";
import cloudinary from "@/config/cloudinary.js";

connectDB();


export async function GET(request, context) {
    try {
        const { params } = await context;
        const { id } = await params;

        console.log('GET Panchayat by ID:', id);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid panchayat ID" },
                { status: 400 }
            );
        }

        // Fetch panchayat with ALL fields
        const panchayat = await GramPanchayat.findById(id)
            .populate('district', 'name slug headerImage coordinates')
            .populate('createdBy', 'name email role')
            .populate('mediaGallery')
            .populate('rtcReport.coordinator', 'name email employeeId designation')
            .lean(); // Use lean() for better performance and to get plain object

        if (!panchayat) {
            return NextResponse.json(
                { success: false, message: "Gram Panchayat not found" },
                { status: 404 }
            );
        }

        console.log('Panchayat found, sending response with all fields');
        console.log('BasicInfo:', panchayat.basicInfo);
        console.log('CulturalInfo:', panchayat.culturalInfo);
        console.log('PoliticalOverview length:', panchayat.politicalOverview?.length || 0);

        return NextResponse.json({ success: true, panchayat }, { status: 200 });
    } catch (error) {
        console.error("Get Panchayat Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request, context) {
    try {
        console.log('=== PUT REQUEST STARTED ===');
        
        const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

        if (!hasAccess) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Only admins and RTCs can update panchayats." },
                { status: 403 }
            );
        }

        const { params } = await context;
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid panchayat ID" },
                { status: 400 }
            );
        }

        const existingPanchayat = await GramPanchayat.findById(id);
        if (!existingPanchayat) {
            return NextResponse.json(
                { success: false, message: "Gram Panchayat not found" },
                { status: 404 }
            );
        }

        if (currentAdmin.role === 'rtc') {
            if (existingPanchayat.createdBy.toString() !== currentAdmin._id.toString()) {
                return NextResponse.json(
                    { success: false, message: "You can only edit panchayats created by you" },
                    { status: 403 }
                );
            }
        }

        const contentType = request.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        let updateData;
        let headerImageUrl;

        if (contentType && contentType.includes('multipart/form-data')) {
            console.log('Processing FormData for update...');
            const formData = await request.formData();
            
            const file = formData.get('headerImage');
            const fileUrl = formData.get('headerImageUrl');
            const uploadMethod = formData.get('uploadMethod') || 'url';
            console.log('Upload Method:', uploadMethod);

            if (uploadMethod === 'file' && file) {
                console.log('Uploading new file to Cloudinary...');
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
                console.log('New image uploaded:', headerImageUrl);
            } else if (uploadMethod === 'url' && fileUrl) {
                headerImageUrl = fileUrl;
                console.log('Using URL for header image:', headerImageUrl);
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

            // Parse arrays
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

            updateData = {
                name: formData.get('name'),
                slug: formData.get('slug'),
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
                status: formData.get('status')
            };

            if (headerImageUrl) {
                updateData.headerImage = headerImageUrl;
            }
        } else {
            console.log('Processing JSON data for update...');
            updateData = await request.json();
        }

        console.log('Update data:', JSON.stringify(updateData, null, 2));

        if (updateData.district && !mongoose.Types.ObjectId.isValid(updateData.district)) {
            return NextResponse.json(
                { success: false, message: "Invalid district ID" },
                { status: 400 }
            );
        }

        if (currentAdmin.role === 'rtc' && updateData.district) {
            const hasDistrictAccess = currentAdmin.assignedDistricts.some(
                d => d.toString() === updateData.district
            );

            if (!hasDistrictAccess) {
                return NextResponse.json(
                    { success: false, message: "You don't have access to move panchayat to this district" },
                    { status: 403 }
                );
            }
        }

        if (updateData.slug && updateData.slug !== existingPanchayat.slug) {
            const duplicateSlug = await GramPanchayat.findOne({ 
                slug: updateData.slug.toLowerCase(),
                district: updateData.district || existingPanchayat.district,
                _id: { $ne: id }
            });

            if (duplicateSlug) {
                return NextResponse.json(
                    { success: false, message: "Panchayat with this slug already exists in this district" },
                    { status: 409 }
                );
            }
        }

        // Validate politicalOverview headings
        if (updateData.politicalOverview && updateData.politicalOverview.length > 0) {
            const validHeadings = [
                'Current Leadership', 'Political History', 'Governing Structure',
                'Major Achievements', 'Recent Developments', 'Election History',
                'Administrative Setup', 'Future Plans', 'Public Participation', 'Key Challenges'
            ];
            
            const invalidHeadings = updateData.politicalOverview.filter(item => !validHeadings.includes(item.heading));
            if (invalidHeadings.length > 0) {
                return NextResponse.json(
                    { success: false, message: `Invalid political overview headings: ${invalidHeadings.map(i => i.heading).join(', ')}` },
                    { status: 400 }
                );
            }
        }

        if (updateData.mediaGallery && updateData.mediaGallery.length > 0) {
            const validMedia = updateData.mediaGallery.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!validMedia) {
                return NextResponse.json(
                    { success: false, message: "Invalid media IDs in mediaGallery" },
                    { status: 400 }
                );
            }
        }

        console.log('Updating panchayat in database...');

        const updatedPanchayat = await GramPanchayat.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('district', 'name slug')
        .populate('createdBy', 'name email role')
        .populate('mediaGallery');

        console.log('Panchayat updated successfully:', updatedPanchayat._id);
        console.log('=== PUT REQUEST COMPLETED ===');

        return NextResponse.json(
            { success: true, message: "Gram Panchayat updated successfully", panchayat: updatedPanchayat },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update Panchayat Error:", error);
        console.error("Error Stack:", error.stack);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, context) {
    try {
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Only admins can delete panchayats." },
                { status: 403 }
            );
        }

        const { params } = await context;
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid panchayat ID" },
                { status: 400 }
            );
        }

        const panchayat = await GramPanchayat.findById(id);
        if (!panchayat) {
            return NextResponse.json(
                { success: false, message: "Gram Panchayat not found" },
                { status: 404 }
            );
        }

        // CASCADE DELETE: Remove panchayat reference from media (from uncommented version)
        if (panchayat.mediaGallery && panchayat.mediaGallery.length > 0) {
            await Media.updateMany(
                { _id: { $in: panchayat.mediaGallery } },
                { $unset: { gramPanchayat: "" } }
            );
        }

        await Media.updateMany(
            { gramPanchayat: id },
            { $unset: { gramPanchayat: "" } }
        );

        // ✅ USE COMMENTED VERSION'S CLOUDINARY LOGIC (BETTER PUBLIC_ID EXTRACTION)
        if (panchayat.headerImage && panchayat.headerImage.includes('cloudinary')) {
            try {
                let publicId;
                const url = panchayat.headerImage;
                
                console.log('Panchayat Header Image URL:', url);

                // USE THE COMMENTED VERSION'S EXTRACTION LOGIC
                if (url.includes('cloudinary.com')) {
                    const parts = url.split('/');
                    const uploadIndex = parts.findIndex(part => part === 'upload');
                    
                    if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
                        // Get everything after 'upload' (skip version if present)
                        const pathAfterUpload = parts.slice(uploadIndex + 1);
                        
                        // Remove version parameter if it exists (starts with 'v')
                        if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
                            pathAfterUpload.shift(); // Remove version
                        }
                        
                        // Join remaining parts to get the full path
                        publicId = pathAfterUpload.join('/');
                        
                        // Remove file extension
                        publicId = publicId.replace(/\.[^/.]+$/, "");
                        
                        console.log('Extracted publicId for panchayat:', publicId);
                    }
                }

                // If extraction failed, use simple method
                if (!publicId) {
                    const filename = url.split('/').pop();
                    publicId = filename.split('.')[0];
                    console.log('Fallback publicId for panchayat:', publicId);
                }

                if (publicId) {
                    console.log(`Deleting panchayat header image from Cloudinary: ${publicId}`);
                    
                    const result = await cloudinary.uploader.destroy(publicId, {
                        resource_type: 'image',
                        invalidate: true
                    });

                    console.log('Cloudinary deletion result for panchayat:', result);

                    if (result.result === 'ok') {
                        console.log(`✅ Successfully deleted panchayat header image: ${publicId}`);
                    } else if (result.result === 'not found') {
                        console.warn(`❌ Panchayat header image not found in Cloudinary: ${publicId}`);
                    } else {
                        console.warn(`⚠️ Cloudinary response for panchayat: ${result.result}`);
                    }
                }
            } catch (cloudError) {
                console.error("Cloudinary delete error for panchayat:", cloudError);
                // Continue with deletion even if Cloudinary delete fails
            }
        }

        // DELETE PANCHAYAT
        await GramPanchayat.findByIdAndDelete(id);

        return NextResponse.json(
            { 
                success: true,
                message: "Gram Panchayat and all associated data deleted successfully",
                deletedPanchayat: {
                    id: panchayat._id,
                    name: panchayat.name,
                    slug: panchayat.slug,
                    district: panchayat.district
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete Panchayat Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}

// export async function DELETE(request, context) {
//     try {
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { success: false, message: "Unauthorized. Only admins can delete panchayats." },
//                 { status: 403 }
//             );
//         }

//         const { params } = await context;
//         const { id } = await params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { success: false, message: "Invalid panchayat ID" },
//                 { status: 400 }
//             );
//         }

//         const panchayat = await GramPanchayat.findById(id);
//         if (!panchayat) {
//             return NextResponse.json(
//                 { success: false, message: "Gram Panchayat not found" },
//                 { status: 404 }
//             );
//         }

//         // CASCADE DELETE: Remove panchayat reference from media
//         if (panchayat.mediaGallery && panchayat.mediaGallery.length > 0) {
//             await Media.updateMany(
//                 { _id: { $in: panchayat.mediaGallery } },
//                 { $unset: { gramPanchayat: "" } }
//             );
//         }

//         await Media.updateMany(
//             { gramPanchayat: id },
//             { $unset: { gramPanchayat: "" } }
//         );

//         // DELETE HEADER IMAGE FROM CLOUDINARY
//         if (panchayat.headerImage && panchayat.headerImage.includes('cloudinary')) {
//             try {
//                 let publicId;
//                 const url = panchayat.headerImage;
                
//                 console.log('Panchayat Header Image URL:', url);

//                 if (url.includes('cloudinary.com')) {
//                     const parts = url.split('/');
//                     const uploadIndex = parts.findIndex(part => part === 'upload');
                    
//                     if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
//                         const pathAfterUpload = parts.slice(uploadIndex + 1);
                        
//                         if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
//                             pathAfterUpload.shift();
//                         }
                        
//                         publicId = pathAfterUpload.join('/');
//                         publicId = publicId.replace(/\.[^/.]+$/, "");
                        
//                         console.log('Extracted publicId for panchayat:', publicId);
//                     }
//                 }

//                 if (!publicId) {
//                     const filename = url.split('/').pop();
//                     publicId = filename.split('.')[0];
//                     console.log('Fallback publicId for panchayat:', publicId);
//                 }

//                 if (publicId) {
//                     console.log(`Deleting panchayat header image from Cloudinary: ${publicId}`);
                    
//                     const result = await cloudinary.uploader.destroy(publicId, {
//                         resource_type: 'image',
//                         invalidate: true
//                     });

//                     console.log('Cloudinary deletion result for panchayat:', result);

//                     if (result.result === 'ok') {
//                         console.log(`✅ Successfully deleted panchayat header image: ${publicId}`);
//                     } else if (result.result === 'not found') {
//                         console.warn(`❌ Panchayat header image not found in Cloudinary: ${publicId}`);
//                     } else {
//                         console.warn(`⚠️ Cloudinary response for panchayat: ${result.result}`);
//                     }
//                 }
//             } catch (cloudError) {
//                 console.error("Cloudinary delete error for panchayat:", cloudError);
//             }
//         }

//         await GramPanchayat.findByIdAndDelete(id);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Gram Panchayat and all associated data deleted successfully",
//                 deletedPanchayat: {
//                     id: panchayat._id,
//                     name: panchayat.name,
//                     slug: panchayat.slug,
//                     district: panchayat.district
//                 }
//             },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error("Delete Panchayat Error:", error);
//         return NextResponse.json(
//             { success: false, message: "Internal Server Error", error: error.message },
//             { status: 500 }
//         );
//     }
// }


// export async function GET(request, context) {
//     try {
//         const { params } = await context;
//         const { id } = await params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { success: false, message: "Invalid panchayat ID" },
//                 { status: 400 }
//             );
//         }

//         const panchayat = await GramPanchayat.findById(id)
//             .populate('district', 'name slug headerImage coordinates')
//             .populate('createdBy', 'name email role')
//             .populate('mediaGallery')
//             .populate('rtcReport.coordinator', 'name email employeeId designation');

//         if (!panchayat) {
//             return NextResponse.json(
//                 { success: false, message: "Gram Panchayat not found" },
//                 { status: 404 }
//             );
//         }

//         return NextResponse.json({ success: true, panchayat }, { status: 200 });
//     } catch (error) {
//         console.error("Get Panchayat Error:", error);
//         return NextResponse.json(
//             { success: false, message: "Internal Server Error", error: error.message },
//             { status: 500 }
//         );
//     }
// }
// export async function PUT(request, context) {
//     try {
//         console.log('=== PUT REQUEST STARTED ===');
        
//         const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

//         if (!hasAccess) {
//             return NextResponse.json(
//                 { success: false, message: "Unauthorized. Only admins and RTCs can update panchayats." },
//                 { status: 403 }
//             );
//         }

//         const { params } = await context;
//         const { id } = await params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { success: false, message: "Invalid panchayat ID" },
//                 { status: 400 }
//             );
//         }

//         const existingPanchayat = await GramPanchayat.findById(id);
//         if (!existingPanchayat) {
//             return NextResponse.json(
//                 { success: false, message: "Gram Panchayat not found" },
//                 { status: 404 }
//             );
//         }

//         if (currentAdmin.role === 'rtc') {
//             if (existingPanchayat.createdBy.toString() !== currentAdmin._id.toString()) {
//                 return NextResponse.json(
//                     { success: false, message: "You can only edit panchayats created by you" },
//                     { status: 403 }
//                 );
//             }
//         }

//         const contentType = request.headers.get('content-type');
//         console.log('Content-Type:', contentType);
        
//         let updateData;
//         let headerImageUrl;

//         if (contentType && contentType.includes('multipart/form-data')) {
//             console.log('Processing FormData for update...');
//             const formData = await request.formData();
            
//             const file = formData.get('headerImage');
//             const fileUrl = formData.get('headerImageUrl');
//             const uploadMethod = formData.get('uploadMethod') || 'url';
//             console.log('Upload Method:', uploadMethod);

//             if (uploadMethod === 'file' && file) {
//                 console.log('Uploading new file to Cloudinary...');
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
//                 console.log('New image uploaded:', headerImageUrl);
//             } else if (uploadMethod === 'url' && fileUrl) {
//                 headerImageUrl = fileUrl;
//                 console.log('Using URL for header image:', headerImageUrl);
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
//             } else {
//                 basicInfo.majorRivers = [];
//             }

//             const languagesSpokenStr = formData.get('basicInfo[languagesSpoken]');
//             if (languagesSpokenStr) {
//                 basicInfo.languagesSpoken = languagesSpokenStr.split(',').map(item => item.trim()).filter(item => item);
//             } else {
//                 basicInfo.languagesSpoken = [];
//             }

//             console.log('Parsed basicInfo:', basicInfo);

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

//             console.log('Parsed culturalInfo:', culturalInfo);

//             // Parse arrays
//             const politicalOverview = [];
//             const politicalOverviewStr = formData.get('politicalOverview');
//             if (politicalOverviewStr) {
//                 try {
//                     const parsed = JSON.parse(politicalOverviewStr);
//                     politicalOverview.push(...parsed);
//                     console.log('Parsed politicalOverview:', politicalOverview);
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
//                     console.log('Parsed transportationServices:', transportationServices);
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
//                     console.log('Parsed hospitalityServices:', hospitalityServices);
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
//                     console.log('Parsed emergencyDirectory:', emergencyDirectory);
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
//                     console.log('Parsed specialPersons:', specialPersons);
//                 } catch (e) {
//                     console.error('Error parsing specialPersons:', e);
//                 }
//             }

//             updateData = {
//                 name: formData.get('name'),
//                 slug: formData.get('slug'),
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
//                 status: formData.get('status')
//             };

//             if (headerImageUrl) {
//                 updateData.headerImage = headerImageUrl;
//             }
//         } else {
//             console.log('Processing JSON data for update...');
//             updateData = await request.json();
//         }

//         console.log('Update data:', JSON.stringify(updateData, null, 2));

//         if (updateData.district && !mongoose.Types.ObjectId.isValid(updateData.district)) {
//             return NextResponse.json(
//                 { success: false, message: "Invalid district ID" },
//                 { status: 400 }
//             );
//         }

//         if (currentAdmin.role === 'rtc' && updateData.district) {
//             const hasDistrictAccess = currentAdmin.assignedDistricts.some(
//                 d => d.toString() === updateData.district
//             );

//             if (!hasDistrictAccess) {
//                 return NextResponse.json(
//                     { success: false, message: "You don't have access to move panchayat to this district" },
//                     { status: 403 }
//                 );
//             }
//         }

//         if (updateData.slug && updateData.slug !== existingPanchayat.slug) {
//             const duplicateSlug = await GramPanchayat.findOne({ 
//                 slug: updateData.slug.toLowerCase(),
//                 district: updateData.district || existingPanchayat.district,
//                 _id: { $ne: id }
//             });

//             if (duplicateSlug) {
//                 return NextResponse.json(
//                     { success: false, message: "Panchayat with this slug already exists in this district" },
//                     { status: 409 }
//                 );
//             }
//         }

//         // Validate politicalOverview headings
//         if (updateData.politicalOverview && updateData.politicalOverview.length > 0) {
//             const validHeadings = [
//                 'Current Leadership', 'Political History', 'Governing Structure',
//                 'Major Achievements', 'Recent Developments', 'Election History',
//                 'Administrative Setup', 'Future Plans', 'Public Participation', 'Key Challenges'
//             ];
            
//             const invalidHeadings = updateData.politicalOverview.filter(item => !validHeadings.includes(item.heading));
//             if (invalidHeadings.length > 0) {
//                 return NextResponse.json(
//                     { success: false, message: `Invalid political overview headings: ${invalidHeadings.map(i => i.heading).join(', ')}` },
//                     { status: 400 }
//                 );
//             }
//         }

//         if (updateData.mediaGallery && updateData.mediaGallery.length > 0) {
//             const validMedia = updateData.mediaGallery.every(id => mongoose.Types.ObjectId.isValid(id));
//             if (!validMedia) {
//                 return NextResponse.json(
//                     { success: false, message: "Invalid media IDs in mediaGallery" },
//                     { status: 400 }
//                 );
//             }
//         }

//         console.log('Updating panchayat in database...');

//         const updatedPanchayat = await GramPanchayat.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         )
//         .populate('district', 'name slug')
//         .populate('createdBy', 'name email role')
//         .populate('mediaGallery');

//         console.log('Panchayat updated successfully:', updatedPanchayat._id);
//         console.log('=== PUT REQUEST COMPLETED ===');

//         return NextResponse.json(
//             { success: true, message: "Gram Panchayat updated successfully", panchayat: updatedPanchayat },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error("Update Panchayat Error:", error);
//         console.error("Error Stack:", error.stack);
//         return NextResponse.json(
//             { success: false, message: "Internal Server Error", error: error.message },
//             { status: 500 }
//         );
//     }
// }

// export async function DELETE(request, context) {
//     try {
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { success: false, message: "Unauthorized. Only admins can delete panchayats." },
//                 { status: 403 }
//             );
//         }

//         const { params } = await context;
//         const { id } = await params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { success: false, message: "Invalid panchayat ID" },
//                 { status: 400 }
//             );
//         }

//         const panchayat = await GramPanchayat.findById(id);
//         if (!panchayat) {
//             return NextResponse.json(
//                 { success: false, message: "Gram Panchayat not found" },
//                 { status: 404 }
//             );
//         }

//         // CASCADE DELETE: Remove panchayat reference from media
//         if (panchayat.mediaGallery && panchayat.mediaGallery.length > 0) {
//             await Media.updateMany(
//                 { _id: { $in: panchayat.mediaGallery } },
//                 { $unset: { gramPanchayat: "" } }
//             );
//         }

//         // Remove panchayat reference from all media that might be linked
//         await Media.updateMany(
//             { gramPanchayat: id },
//             { $unset: { gramPanchayat: "" } }
//         );

//         // DELETE HEADER IMAGE FROM CLOUDINARY - FIXED
//         if (panchayat.headerImage && panchayat.headerImage.includes('cloudinary')) {
//             try {
//                 let publicId;
//                 const url = panchayat.headerImage;
                
//                 console.log('Panchayat Header Image URL:', url);

//                 // Extract public_id from Cloudinary URL
//                 if (url.includes('cloudinary.com')) {
//                     const parts = url.split('/');
//                     const uploadIndex = parts.findIndex(part => part === 'upload');
                    
//                     if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
//                         // Get everything after 'upload' (skip version if present)
//                         const pathAfterUpload = parts.slice(uploadIndex + 1);
                        
//                         // Remove version parameter if it exists (starts with 'v')
//                         if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
//                             pathAfterUpload.shift(); // Remove version
//                         }
                        
//                         // Join remaining parts to get the full path
//                         publicId = pathAfterUpload.join('/');
                        
//                         // Remove file extension
//                         publicId = publicId.replace(/\.[^/.]+$/, "");
                        
//                         console.log('Extracted publicId for panchayat:', publicId);
//                     }
//                 }

//                 // If extraction failed, use simple method
//                 if (!publicId) {
//                     const filename = url.split('/').pop();
//                     publicId = filename.split('.')[0];
//                     console.log('Fallback publicId for panchayat:', publicId);
//                 }

//                 if (publicId) {
//                     console.log(`Deleting panchayat header image from Cloudinary: ${publicId}`);
                    
//                     const result = await cloudinary.uploader.destroy(publicId, {
//                         resource_type: 'image',
//                         invalidate: true
//                     });

//                     console.log('Cloudinary deletion result for panchayat:', result);

//                     if (result.result === 'ok') {
//                         console.log(`✅ Successfully deleted panchayat header image: ${publicId}`);
//                     } else if (result.result === 'not found') {
//                         console.warn(`❌ Panchayat header image not found in Cloudinary: ${publicId}`);
//                     } else {
//                         console.warn(`⚠️ Cloudinary response for panchayat: ${result.result}`);
//                     }
//                 }
//             } catch (cloudError) {
//                 console.error("Cloudinary delete error for panchayat:", cloudError);
//                 // Continue with deletion even if Cloudinary delete fails
//             }
//         }

//         // DELETE PANCHAYAT
//         await GramPanchayat.findByIdAndDelete(id);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Gram Panchayat and all associated data deleted successfully",
//                 deletedPanchayat: {
//                     id: panchayat._id,
//                     name: panchayat.name,
//                     slug: panchayat.slug,
//                     district: panchayat.district
//                 }
//             },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error("Delete Panchayat Error:", error);
//         return NextResponse.json(
//             { success: false, message: "Internal Server Error", error: error.message },
//             { status: 500 }
//         );
//     }
// }
