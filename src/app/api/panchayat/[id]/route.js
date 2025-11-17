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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: "Invalid panchayat ID" },
                { status: 400 }
            );
        }

        const panchayat = await GramPanchayat.findById(id)
            .populate('district', 'name slug headerImage coordinates')
            .populate('createdBy', 'name email role')
            .populate('mediaGallery')
            .populate('rtcReport.coordinator', 'name email employeeId designation');

        if (!panchayat) {
            return NextResponse.json(
                { success: false, message: "Gram Panchayat not found" },
                { status: 404 }
            );
        }

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
        let updateData;
        let headerImageUrl;

        if (contentType && contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            const file = formData.get('headerImage');
            const fileUrl = formData.get('headerImageUrl');
            const uploadMethod = formData.get('uploadMethod') || 'url';

            if (uploadMethod === 'file' && file) {
                const maxSize = 50 * 1024 * 1024;
                if (file.size > maxSize) {
                    return NextResponse.json(
                        { success: false, message: "File size exceeds 50MB limit" },
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
            } else if (uploadMethod === 'url' && fileUrl) {
                headerImageUrl = fileUrl;
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
                establishmentYear: formData.get('establishmentYear') ? parseInt(formData.get('establishmentYear')) : undefined,
                historicalBackground: formData.get('historicalBackground'),
                population: formData.get('population') ? parseInt(formData.get('population')) : undefined,
                area: formData.get('area') ? parseFloat(formData.get('area')) : undefined,
                localArt: formData.get('localArt'),
                localCuisine: formData.get('localCuisine'),
                traditions: formData.get('traditions'),
                status: formData.get('status'),
                majorRivers: formData.get('majorRivers')?.split(',').map(item => item.trim()).filter(item => item) || []
            };

            if (headerImageUrl) {
                updateData.headerImage = headerImageUrl;
            }
        } else {
            updateData = await request.json();
        }

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

        if (updateData.mediaGallery && updateData.mediaGallery.length > 0) {
            const validMedia = updateData.mediaGallery.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!validMedia) {
                return NextResponse.json(
                    { success: false, message: "Invalid media IDs in mediaGallery" },
                    { status: 400 }
                );
            }
        }

        const updatedPanchayat = await GramPanchayat.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('district', 'name slug')
        .populate('createdBy', 'name email role')
        .populate('mediaGallery');

        return NextResponse.json(
            { success: true, message: "Gram Panchayat updated successfully", panchayat: updatedPanchayat },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update Panchayat Error:", error);
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

        // CASCADE DELETE: Remove panchayat reference from media
        if (panchayat.mediaGallery && panchayat.mediaGallery.length > 0) {
            await Media.updateMany(
                { _id: { $in: panchayat.mediaGallery } },
                { $unset: { gramPanchayat: "" } }
            );
        }

        // Remove panchayat reference from all media that might be linked
        await Media.updateMany(
            { gramPanchayat: id },
            { $unset: { gramPanchayat: "" } }
        );

        // DELETE HEADER IMAGE FROM CLOUDINARY - FIXED
        if (panchayat.headerImage && panchayat.headerImage.includes('cloudinary')) {
            try {
                let publicId;
                const url = panchayat.headerImage;
                
                console.log('Panchayat Header Image URL:', url);

                // Extract public_id from Cloudinary URL
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

//         // Remove panchayat reference from all media that might be linked
//         await Media.updateMany(
//             { gramPanchayat: id },
//             { $unset: { gramPanchayat: "" } }
//         );

//         // DELETE HEADER IMAGE FROM CLOUDINARY (Optional - if you want to delete from Cloudinary)
//         if (panchayat.headerImage && panchayat.headerImage.includes('cloudinary')) {
//             try {
//                 const publicId = panchayat.headerImage.split('/').slice(-2).join('/').split('.')[0];
//                 await cloudinary.uploader.destroy(`mptourify/panchayat/${publicId}`);
//             } catch (cloudError) {
//                 console.error("Cloudinary delete error:", cloudError);
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

// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { checkRole, getAdmin } from "@/utils/getAdmin.js";
// import Media from "@/models/mediaModel.js";
// import mongoose from "mongoose";
// import GramPanchayat from "@/models/panchayatModel.js";
// import cloudinary from "@/config/cloudinary.js";

// connectDB();

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
//         let updateData;
//         let headerImageUrl;

//         if (contentType && contentType.includes('multipart/form-data')) {
//             const formData = await request.formData();
            
//             const file = formData.get('headerImage');
//             const fileUrl = formData.get('headerImageUrl');
//             const uploadMethod = formData.get('uploadMethod') || 'url';

//             if (uploadMethod === 'file' && file) {
//                 const maxSize = 50 * 1024 * 1024;
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
//                 establishmentYear: formData.get('establishmentYear') ? parseInt(formData.get('establishmentYear')) : undefined,
//                 historicalBackground: formData.get('historicalBackground'),
//                 population: formData.get('population') ? parseInt(formData.get('population')) : undefined,
//                 area: formData.get('area') ? parseFloat(formData.get('area')) : undefined,
//                 localArt: formData.get('localArt'),
//                 localCuisine: formData.get('localCuisine'),
//                 traditions: formData.get('traditions'),
//                 status: formData.get('status'),
//                 majorRivers: formData.get('majorRivers')?.split(',').map(item => item.trim()).filter(item => item) || []
//             };

//             if (headerImageUrl) {
//                 updateData.headerImage = headerImageUrl;
//             }
//         } else {
//             updateData = await request.json();
//         }

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

//         if (updateData.mediaGallery && updateData.mediaGallery.length > 0) {
//             const validMedia = updateData.mediaGallery.every(id => mongoose.Types.ObjectId.isValid(id));
//             if (!validMedia) {
//                 return NextResponse.json(
//                     { success: false, message: "Invalid media IDs in mediaGallery" },
//                     { status: 400 }
//                 );
//             }
//         }

//         const updatedPanchayat = await GramPanchayat.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         )
//         .populate('district', 'name slug')
//         .populate('createdBy', 'name email role')
//         .populate('mediaGallery');

//         return NextResponse.json(
//             { success: true, message: "Gram Panchayat updated successfully", panchayat: updatedPanchayat },
//             { status: 200 }
//         );
//     } catch (error) {
//         console.error("Update Panchayat Error:", error);
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

//         await GramPanchayat.findByIdAndDelete(id);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Gram Panchayat deleted successfully",
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



// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { checkRole, getAdmin } from "@/utils/getAdmin.js";
// import Media from "@/models/mediaModel.js";
// import mongoose from "mongoose";
// import GramPanchayat from "@/models/panchayatModel.js";

// connectDB();

// export async function GET(request, context) {
//     try {
//         const { params } = await context;
//         const { id } = await params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid panchayat ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         const panchayat = await GramPanchayat.findById(id)
//             .populate('district', 'name slug headerImage coordinates')
//             .populate('createdBy', 'name email role')
//             .populate('photoGallery')
//             .populate('videoGallery')
//             .populate('rtcReport.coordinator', 'name email employeeId designation');

//         if (!panchayat) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Gram Panchayat not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         return NextResponse.json(
//             { 
//                 success: true,
//                 panchayat
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get Panchayat Error:", error);
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

// export async function PUT(request, context) {
//     try {
//         const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

//         if (!hasAccess) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins and RTCs can update panchayats." 
//                 },
//                 { status: 403 }
//             );
//         }

//         const { params } = await context;
//         const { id } = await params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid panchayat ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         const existingPanchayat = await GramPanchayat.findById(id);
//         if (!existingPanchayat) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Gram Panchayat not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         if (currentAdmin.role === 'rtc') {
//             if (existingPanchayat.createdBy.toString() !== currentAdmin._id.toString()) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "You can only edit panchayats created by you" 
//                     },
//                     { status: 403 }
//                 );
//             }
//         }

//         const updateData = await request.json();

//         if (updateData.district) {
//             if (!mongoose.Types.ObjectId.isValid(updateData.district)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid district ID" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             if (currentAdmin.role === 'rtc') {
//                 const hasDistrictAccess = currentAdmin.assignedDistricts.some(
//                     d => d.toString() === updateData.district
//                 );

//                 if (!hasDistrictAccess) {
//                     return NextResponse.json(
//                         { 
//                             success: false,
//                             message: "You don't have access to move panchayat to this district" 
//                         },
//                         { status: 403 }
//                     );
//                 }
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
//                     { 
//                         success: false,
//                         message: "Panchayat with this slug already exists in this district" 
//                     },
//                     { status: 409 }
//                 );
//             }
//         }

//         if (updateData.photoGallery && updateData.photoGallery.length > 0) {
//             const validPhotos = updateData.photoGallery.every(id => mongoose.Types.ObjectId.isValid(id));
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

//         if (updateData.videoGallery && updateData.videoGallery.length > 0) {
//             const validVideos = updateData.videoGallery.every(id => mongoose.Types.ObjectId.isValid(id));
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

//         const updatedPanchayat = await GramPanchayat.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         )
//         .populate('district', 'name slug')
//         .populate('createdBy', 'name email role')
//         .populate('photoGallery')
//         .populate('videoGallery');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Gram Panchayat updated successfully",
//                 panchayat: updatedPanchayat
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Update Panchayat Error:", error);
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

// export async function DELETE(request, context) {
//     try {
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can delete panchayats." 
//                 },
//                 { status: 403 }
//             );
//         }

//         const { params } = await context;
//         const { id } = await params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid panchayat ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         const panchayat = await GramPanchayat.findById(id);
//         if (!panchayat) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Gram Panchayat not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         if (panchayat.photoGallery && panchayat.photoGallery.length > 0) {
//             await Media.updateMany(
//                 { _id: { $in: panchayat.photoGallery } },
//                 { $unset: { gramPanchayat: "" } }
//             );
//         }

//         if (panchayat.videoGallery && panchayat.videoGallery.length > 0) {
//             await Media.updateMany(
//                 { _id: { $in: panchayat.videoGallery } },
//                 { $unset: { gramPanchayat: "" } }
//             );
//         }

//         await Media.updateMany(
//             { gramPanchayat: id },
//             { $unset: { gramPanchayat: "" } }
//         );

//         await GramPanchayat.findByIdAndDelete(id);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Gram Panchayat deleted successfully",
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
//             { 
//                 success: false,
//                 message: "Internal Server Error",
//                 error: error.message 
//             },
//             { status: 500 }
//         );
//     }
// }


// // GET, UPDATE, DELETE PANCHAYAT BY ID
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { checkRole, getAdmin } from "@/utils/getAdmin.js";
// import Media from "@/models/mediaModel.js";
// import mongoose from "mongoose";
// import GramPanchayat from "@/models/panchayatModel.js";

// connectDB();

// // GET PANCHAYAT BY ID
// export async function GET(request, context) {
//     try {
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid panchayat ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // FIND PANCHAYAT
//         const panchayat = await GramPanchayat.findById(id)
//             .populate('district', 'name slug headerImage coordinates')
//             .populate('createdBy', 'name email role')
//             .populate('photoGallery')
//             .populate('videoGallery')
//             .populate('rtcReport.coordinator', 'name email employeeId designation');

//         if (!panchayat) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Gram Panchayat not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         return NextResponse.json(
//             { 
//                 success: true,
//                 panchayat
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get Panchayat Error:", error);
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

// // UPDATE PANCHAYAT BY ID
// export async function PUT(request, context) {
//     try {
//         // CHECK IF USER HAS ACCESS (ADMIN OR RTC)
//         const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

//         if (!hasAccess) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins and RTCs can update panchayats." 
//                 },
//                 { status: 403 }
//             );
//         }

//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid panchayat ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF PANCHAYAT EXISTS
//         const existingPanchayat = await GramPanchayat.findById(id);
//         if (!existingPanchayat) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Gram Panchayat not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // IF RTC, CHECK OWNERSHIP (RTC CAN ONLY EDIT THEIR OWN PANCHAYATS)
//         if (currentAdmin.role === 'rtc') {
//             if (existingPanchayat.createdBy.toString() !== currentAdmin._id.toString()) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "You can only edit panchayats created by you" 
//                     },
//                     { status: 403 }
//                 );
//             }
//         }

//         const updateData = await request.json();

//         // IF DISTRICT IS BEING UPDATED, VALIDATE IT
//         if (updateData.district) {
//             if (!mongoose.Types.ObjectId.isValid(updateData.district)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid district ID" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             // IF RTC, CHECK IF NEW DISTRICT IS IN THEIR ASSIGNED DISTRICTS
//             if (currentAdmin.role === 'rtc') {
//                 const hasDistrictAccess = currentAdmin.assignedDistricts.some(
//                     d => d.toString() === updateData.district
//                 );

//                 if (!hasDistrictAccess) {
//                     return NextResponse.json(
//                         { 
//                             success: false,
//                             message: "You don't have access to move panchayat to this district" 
//                         },
//                         { status: 403 }
//                     );
//                 }
//             }
//         }

//         // IF SLUG IS BEING UPDATED, CHECK FOR DUPLICATES
//         if (updateData.slug && updateData.slug !== existingPanchayat.slug) {
//             const duplicateSlug = await GramPanchayat.findOne({ 
//                 slug: updateData.slug.toLowerCase(),
//                 district: updateData.district || existingPanchayat.district,
//                 _id: { $ne: id }
//             });

//             if (duplicateSlug) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Panchayat with this slug already exists in this district" 
//                     },
//                     { status: 409 }
//                 );
//             }
//         }

//         // VALIDATE MEDIA IDs IF PROVIDED
//         if (updateData.photoGallery && updateData.photoGallery.length > 0) {
//             const validPhotos = updateData.photoGallery.every(id => mongoose.Types.ObjectId.isValid(id));
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

//         if (updateData.videoGallery && updateData.videoGallery.length > 0) {
//             const validVideos = updateData.videoGallery.every(id => mongoose.Types.ObjectId.isValid(id));
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

//         // UPDATE PANCHAYAT
//         const updatedPanchayat = await GramPanchayat.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         )
//         .populate('district', 'name slug')
//         .populate('createdBy', 'name email role')
//         .populate('photoGallery')
//         .populate('videoGallery');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Gram Panchayat updated successfully",
//                 panchayat: updatedPanchayat
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Update Panchayat Error:", error);
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

// // DELETE PANCHAYAT BY ID
// export async function DELETE(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN (ONLY ADMIN CAN DELETE)
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can delete panchayats." 
//                 },
//                 { status: 403 }
//             );
//         }

//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid panchayat ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF PANCHAYAT EXISTS
//         const panchayat = await GramPanchayat.findById(id);
//         if (!panchayat) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Gram Panchayat not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // CASCADE DELETE: REMOVE PANCHAYAT REFERENCE FROM MEDIA
//         if (panchayat.photoGallery && panchayat.photoGallery.length > 0) {
//             await Media.updateMany(
//                 { _id: { $in: panchayat.photoGallery } },
//                 { $unset: { gramPanchayat: "" } }
//             );
//         }

//         if (panchayat.videoGallery && panchayat.videoGallery.length > 0) {
//             await Media.updateMany(
//                 { _id: { $in: panchayat.videoGallery } },
//                 { $unset: { gramPanchayat: "" } }
//             );
//         }

//         // ALSO REMOVE PANCHAYAT REFERENCE FROM OTHER MEDIA THAT REFERENCE IT
//         await Media.updateMany(
//             { gramPanchayat: id },
//             { $unset: { gramPanchayat: "" } }
//         );

//         // DELETE PANCHAYAT
//         await GramPanchayat.findByIdAndDelete(id);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Gram Panchayat deleted successfully",
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
//             { 
//                 success: false,
//                 message: "Internal Server Error",
//                 error: error.message 
//             },
//             { status: 500 }
//         );
//     }
// }