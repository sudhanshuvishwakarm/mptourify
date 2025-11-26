// UPLOAD MEDIA (Photo/Video) - FIXED
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { checkRole } from "@/utils/getAdmin.js";
import Media from "@/models/mediaModel.js";
import District from "@/models/districtModel.js";
import cloudinary from "@/config/cloudinary.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel.js";

connectDB();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
    try {
        const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

        if (!hasAccess) {
            return NextResponse.json(
                { success: false, message: "Unauthorized. Only admins and RTCs can upload media." },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const title = formData.get('title');
        const description = formData.get('description');
        const category = formData.get('category');
        const tags = formData.get('tags');
        const districtId = formData.get('district');
        const panchayatId = formData.get('panchayat');
        const photographer = formData.get('photographer');
        const captureDate = formData.get('captureDate');
        const fileUrl = formData.get('fileUrl');
        const uploadMethod = formData.get('uploadMethod') || 'file';

        // VALIDATE
        if (uploadMethod === 'file' && !file) {
            return NextResponse.json(
                { success: false, message: "Please provide file, title, and category" },
                { status: 400 }
            );
        }

        if (uploadMethod === 'url' && !fileUrl) {
            return NextResponse.json(
                { success: false, message: "Please provide file URL, title, and category" },
                { status: 400 }
            );
        }

        if (!title || !category) {
            return NextResponse.json(
                { success: false, message: "Please provide title and category" },
                { status: 400 }
            );
        }

        const validCategories = ['heritage', 'natural', 'cultural', 'event', 'festival'];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { success: false, message: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
                { status: 400 }
            );
        }

        // VALIDATE DISTRICT
        let districtExists = null;
        if (districtId) {
            if (!mongoose.Types.ObjectId.isValid(districtId)) {
                return NextResponse.json({ success: false, message: "Invalid district ID" }, { status: 400 });
            }

            districtExists = await District.findById(districtId);
            if (!districtExists) {
                return NextResponse.json({ success: false, message: "District not found" }, { status: 404 });
            }

            if (currentAdmin.role === 'rtc') {
                const hasDistrictAccess = currentAdmin.assignedDistricts?.some(d => d.toString() === districtId);
                if (!hasDistrictAccess) {
                    return NextResponse.json(
                        { success: false, message: "You don't have access to upload media for this district" },
                        { status: 403 }
                    );
                }
            }
        }

        // VALIDATE PANCHAYAT
        let panchayatExists = null;
        if (panchayatId) {
            if (!mongoose.Types.ObjectId.isValid(panchayatId)) {
                return NextResponse.json({ success: false, message: "Invalid panchayat ID" }, { status: 400 });
            }

            panchayatExists = await GramPanchayat.findById(panchayatId);
            if (!panchayatExists) {
                return NextResponse.json({ success: false, message: "Panchayat not found" }, { status: 404 });
            }

            if (districtId && panchayatExists.district.toString() !== districtId) {
                return NextResponse.json(
                    { success: false, message: "Panchayat does not belong to the selected district" },
                    { status: 400 }
                );
            }
        }

        let uploadResult;
        let fileType;
        let thumbnailUrl;

        if (uploadMethod === 'file') {
            const maxSize = 95 * 1024 * 1024;
            if (file.size > maxSize) {
                return NextResponse.json({ success: false, message: "File size exceeds 50MB limit" }, { status: 400 });
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            fileType = file.type.startsWith('video/') ? 'video' : 'image';

            uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'mptourify/media',
                        resource_type: 'auto',
                        transformation: fileType === 'image' ? [
                            { width: 1920, height: 1080, crop: 'limit' },
                            { quality: 'auto:good' }
                        ] : undefined
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });

            thumbnailUrl = uploadResult.secure_url;
            if (fileType === 'video') {
                thumbnailUrl = cloudinary.url(uploadResult.public_id, {
                    resource_type: 'video',
                    format: 'jpg',
                    transformation: [{ width: 640, height: 360, crop: 'fill' }]
                });
            }
        } else {
            fileType = fileUrl.match(/\.(mp4|webm|mov|avi)$/i) ? 'video' : 'image';
            uploadResult = { secure_url: fileUrl };
            thumbnailUrl = fileUrl;
        }

        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        // CREATE MEDIA
        const media = await Media.create({
            title,
            description: description || '',
            fileUrl: uploadResult.secure_url,
            thumbnailUrl,
            fileType,
            category,
            tags: tagsArray,
            district: districtId || null,
            gramPanchayat: panchayatId || null,
            photographer: photographer || '',
            captureDate: captureDate || null,
            status: currentAdmin.role === 'admin' ? 'approved' : 'pending',
            uploadedBy: currentAdmin._id
        });

        // UPDATE PANCHAYAT MEDIA GALLERY (FIXED - using mediaGallery)
        if (panchayatId && panchayatExists) {
            await GramPanchayat.findByIdAndUpdate(
                panchayatId,
                { $addToSet: { mediaGallery: media._id } }
            );
            console.log(`Added media ${media._id} to panchayat ${panchayatId} mediaGallery`);
        }

        // POPULATE
        await media.populate('district', 'name slug');
        await media.populate('gramPanchayat', 'name slug');
        await media.populate('uploadedBy', 'name email role');

        return NextResponse.json(
            { success: true, message: "Media uploaded successfully", media },
            { status: 201 }
        );

    } catch (error) {
        console.error("Upload Media Error:", error);
        
        if (error.message.includes('Invalid cloud_name')) {
            return NextResponse.json(
                { success: false, message: "Cloudinary configuration error. Please check your credentials." },
                { status: 500 }
            );
        }
        
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}


// // UPLOAD MEDIA (Photo/Video)
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { checkRole } from "@/utils/getAdmin.js";
// import Media from "@/models/mediaModel.js";
// import District from "@/models/districtModel.js";
// import cloudinary from "@/config/cloudinary.js";
// import mongoose from "mongoose";
// import GramPanchayat from "@/models/panchayatModel.js";

// connectDB();

// // Disable body parsing for file uploads (Next.js 15+)
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

// export async function POST(request) {
//     try {
//         // CHECK IF USER HAS ACCESS (ADMIN OR RTC)
//         const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

//         if (!hasAccess) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins and RTCs can upload media." 
//                 },
//                 { status: 403 }
//             );
//         }

//         // GET FORM DATA
//         const formData = await request.formData();
//         const file = formData.get('file');
//         const title = formData.get('title');
//         const description = formData.get('description');
//         const category = formData.get('category');
//         const tags = formData.get('tags'); // Comma-separated string
//         const districtId = formData.get('district');
//         const panchayatId = formData.get('panchayat');
//         const photographer = formData.get('photographer');
//         const captureDate = formData.get('captureDate');
//         const fileUrl = formData.get('fileUrl'); // For URL upload
//         const uploadMethod = formData.get('uploadMethod') || 'file'; // file or url

//         // VALIDATE REQUIRED FIELDS
//         if (uploadMethod === 'file' && !file) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Please provide file, title, and category" 
//                 },
//                 { status: 400 }
//             );
//         }

//         if (uploadMethod === 'url' && !fileUrl) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Please provide file URL, title, and category" 
//                 },
//                 { status: 400 }
//             );
//         }

//         if (!title || !category) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Please provide title and category" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE CATEGORY
//         const validCategories = ['heritage', 'natural', 'cultural', 'event', 'festival'];
//         if (!validCategories.includes(category)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE DISTRICT IF PROVIDED
//         let districtExists = null;
//         if (districtId) {
//             if (!mongoose.Types.ObjectId.isValid(districtId)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid district ID" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             districtExists = await District.findById(districtId);
//             if (!districtExists) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "District not found" 
//                     },
//                     { status: 404 }
//                 );
//             }

//             // IF RTC, CHECK DISTRICT ACCESS
//             if (currentAdmin.role === 'rtc') {
//                 const hasDistrictAccess = currentAdmin.assignedDistricts?.some(
//                     d => d.toString() === districtId
//                 );

//                 if (!hasDistrictAccess) {
//                     return NextResponse.json(
//                         { 
//                             success: false,
//                             message: "You don't have access to upload media for this district" 
//                         },
//                         { status: 403 }
//                     );
//                 }
//             }
//         }

//         // VALIDATE PANCHAYAT IF PROVIDED
//         let panchayatExists = null;
//         if (panchayatId) {
//             if (!mongoose.Types.ObjectId.isValid(panchayatId)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid panchayat ID" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             panchayatExists = await GramPanchayat.findById(panchayatId);
//             if (!panchayatExists) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Panchayat not found" 
//                     },
//                     { status: 404 }
//                 );
//             }

//             // VERIFY PANCHAYAT BELONGS TO SELECTED DISTRICT
//             if (districtId && panchayatExists.district.toString() !== districtId) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Panchayat does not belong to the selected district" 
//                     },
//                     { status: 400 }
//                 );
//             }
//         }

//         let uploadResult;
//         let fileType;
//         let thumbnailUrl;

//         if (uploadMethod === 'file') {
//             // VALIDATE FILE SIZE (Max 95MB)
//             const maxSize = 95 * 1024 * 1024; // 50MB
//             if (file.size > maxSize) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "File size exceeds 50MB limit" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             // CONVERT FILE TO BUFFER
//             const bytes = await file.arrayBuffer();
//             const buffer = Buffer.from(bytes);

//             // DETERMINE FILE TYPE
//             fileType = file.type.startsWith('video/') ? 'video' : 'image';

//             // UPLOAD TO CLOUDINARY WITH FOLDER STRUCTURE
//             uploadResult = await new Promise((resolve, reject) => {
//                 const uploadStream = cloudinary.uploader.upload_stream(
//                     {
//                         folder: 'mptourify/media', // Updated folder structure
//                         resource_type: 'auto',
//                         transformation: fileType === 'image' ? [
//                             { width: 1920, height: 1080, crop: 'limit' },
//                             { quality: 'auto:good' }
//                         ] : undefined
//                     },
//                     (error, result) => {
//                         if (error) reject(error);
//                         else resolve(result);
//                     }
//                 );
//                 uploadStream.end(buffer);
//             });

//             // CREATE THUMBNAIL URL
//             thumbnailUrl = uploadResult.secure_url;
//             if (fileType === 'video') {
//                 // For video, create thumbnail from first frame
//                 thumbnailUrl = cloudinary.url(uploadResult.public_id, {
//                     resource_type: 'video',
//                     format: 'jpg',
//                     transformation: [
//                         { width: 640, height: 360, crop: 'fill' }
//                     ]
//                 });
//             }
//         } else {
//             // Handle URL upload
//             fileType = fileUrl.match(/\.(mp4|webm|mov|avi)$/i) ? 'video' : 'image';
//             uploadResult = { secure_url: fileUrl };
//             thumbnailUrl = fileUrl;
//         }

//         // PARSE TAGS
//         const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

//         // CREATE MEDIA DOCUMENT
//         const media = await Media.create({
//             title,
//             description: description || '',
//             fileUrl: uploadResult.secure_url,
//             thumbnailUrl,
//             fileType,
//             category,
//             tags: tagsArray,
//             district: districtId || null,
//             gramPanchayat: panchayatId || null,
//             photographer: photographer || '',
//             captureDate: captureDate || null,
//             status: currentAdmin.role === 'admin' ? 'approved' : 'pending', // Auto-approve for admin
//             uploadedBy: currentAdmin._id,
//             uploadMethod: uploadMethod // Store upload method for reference
//         });

//         // UPDATE PANCHAYAT GALLERY IF PANCHAYAT IS PROVIDED
//         if (panchayatId && panchayatExists) {
//             if (fileType === 'image') {
//                 await GramPanchayat.findByIdAndUpdate(
//                     panchayatId,
//                     { $addToSet: { photoGallery: media._id } }
//                 );
//                 console.log(`Added media ${media._id} to panchayat ${panchayatId} photo gallery`);
//             } else if (fileType === 'video') {
//     await GramPanchayat.findByIdAndUpdate(
//         panchayatId,
//         { $addToSet: { mediaGallery: media._id } }
//     );
//     console.log(`Added media ${media._id} to panchayat ${panchayatId} media gallery`);
// }
//         }

//         // POPULATE RELATIONS
//         await media.populate('district', 'name slug');
//         await media.populate('gramPanchayat', 'name slug');
//         await media.populate('uploadedBy', 'name email role');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Media uploaded successfully",
//                 media
//             },
//             { status: 201 }
//         );

//     } catch (error) {
//         console.error("Upload Media Error:", error);
        
//         // More specific error messages
//         if (error.message.includes('Invalid cloud_name')) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Cloudinary configuration error. Please check your credentials." 
//                 },
//                 { status: 500 }
//             );
//         }
        
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




// // UPLOAD MEDIA (Photo/Video)
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { checkRole } from "@/utils/getAdmin.js";
// import Media from "@/models/mediaModel.js";
// import District from "@/models/districtModel.js";
// import cloudinary from "@/config/cloudinary.js";
// import mongoose from "mongoose";
// import GramPanchayat from "@/models/panchayatModel.js";

// connectDB();

// // Disable body parsing for file uploads (Next.js 15+)
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

// export async function POST(request) {
//     try {
//         // CHECK IF USER HAS ACCESS (ADMIN OR RTC)
//         const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

//         if (!hasAccess) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins and RTCs can upload media." 
//                 },
//                 { status: 403 }
//             );
//         }

//         // GET FORM DATA
//         const formData = await request.formData();
//         const file = formData.get('file');
//         const title = formData.get('title');
//         const description = formData.get('description');
//         const category = formData.get('category');
//         const tags = formData.get('tags'); // Comma-separated string
//         const districtId = formData.get('district');
//         const panchayatId = formData.get('panchayat');
//         const photographer = formData.get('photographer');
//         const captureDate = formData.get('captureDate');

//         // VALIDATE REQUIRED FIELDS
//         if (!file || !title || !category) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Please provide file, title, and category" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE CATEGORY
//         const validCategories = ['heritage', 'natural', 'cultural', 'event', 'festival'];
//         if (!validCategories.includes(category)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE FILE SIZE (Max 95MB)
//         const maxSize = 95 * 1024 * 1024; // 50MB
//         if (file.size > maxSize) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "File size exceeds 50MB limit" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE DISTRICT IF PROVIDED
//         let districtExists = null;
//         if (districtId) {
//             if (!mongoose.Types.ObjectId.isValid(districtId)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid district ID" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             districtExists = await District.findById(districtId);
//             if (!districtExists) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "District not found" 
//                     },
//                     { status: 404 }
//                 );
//             }

//             // IF RTC, CHECK DISTRICT ACCESS
//             if (currentAdmin.role === 'rtc') {
//                 const hasDistrictAccess = currentAdmin.assignedDistricts?.some(
//                     d => d.toString() === districtId
//                 );

//                 if (!hasDistrictAccess) {
//                     return NextResponse.json(
//                         { 
//                             success: false,
//                             message: "You don't have access to upload media for this district" 
//                         },
//                         { status: 403 }
//                     );
//                 }
//             }
//         }

//         // VALIDATE PANCHAYAT IF PROVIDED
//         let panchayatExists = null;
//         if (panchayatId) {
//             if (!mongoose.Types.ObjectId.isValid(panchayatId)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid panchayat ID" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             panchayatExists = await GramPanchayat.findById(panchayatId);
//             if (!panchayatExists) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Panchayat not found" 
//                     },
//                     { status: 404 }
//                 );
//             }

//             // VERIFY PANCHAYAT BELONGS TO SELECTED DISTRICT
//             if (districtId && panchayatExists.district.toString() !== districtId) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Panchayat does not belong to the selected district" 
//                     },
//                     { status: 400 }
//                 );
//             }
//         }

//         // CONVERT FILE TO BUFFER
//         const bytes = await file.arrayBuffer();
//         const buffer = Buffer.from(bytes);

//         // DETERMINE FILE TYPE
//         const fileType = file.type.startsWith('video/') ? 'video' : 'image';

//         // UPLOAD TO CLOUDINARY
//         const uploadResult = await new Promise((resolve, reject) => {
//             const uploadStream = cloudinary.uploader.upload_stream(
//                 {
//                     folder: 'mp-tourify',
//                     resource_type: 'auto',
//                     transformation: fileType === 'image' ? [
//                         { width: 1920, height: 1080, crop: 'limit' },
//                         { quality: 'auto:good' }
//                     ] : undefined
//                 },
//                 (error, result) => {
//                     if (error) reject(error);
//                     else resolve(result);
//                 }
//             );
//             uploadStream.end(buffer);
//         });

//         // CREATE THUMBNAIL URL
//         let thumbnailUrl = uploadResult.secure_url;
//         if (fileType === 'video') {
//             // For video, create thumbnail from first frame
//             thumbnailUrl = cloudinary.url(uploadResult.public_id, {
//                 resource_type: 'video',
//                 format: 'jpg',
//                 transformation: [
//                     { width: 640, height: 360, crop: 'fill' }
//                 ]
//             });
//         }

//         // PARSE TAGS
//         const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

//         // CREATE MEDIA DOCUMENT
//         const media = await Media.create({
//             title,
//             description: description || '',
//             fileUrl: uploadResult.secure_url,
//             thumbnailUrl,
//             fileType,
//             category,
//             tags: tagsArray,
//             district: districtId || null,
//             gramPanchayat: panchayatId || null,
//             photographer: photographer || '',
//             captureDate: captureDate || null,
//             status: currentAdmin.role === 'admin' ? 'approved' : 'pending', // Auto-approve for admin
//             uploadedBy: currentAdmin._id
//         });

//         // UPDATE PANCHAYAT GALLERY IF PANCHAYAT IS PROVIDED
//         if (panchayatId && panchayatExists) {
//             if (fileType === 'image') {
//                 await GramPanchayat.findByIdAndUpdate(
//                     panchayatId,
//                     { $addToSet: { photoGallery: media._id } }
//                 );
//                 console.log(`Added media ${media._id} to panchayat ${panchayatId} photo gallery`);
//             } else if (fileType === 'video') {
//                 await GramPanchayat.findByIdAndUpdate(
//                     panchayatId,
//                     { $addToSet: { videoGallery: media._id } }
//                 );
//                 console.log(`Added media ${media._id} to panchayat ${panchayatId} video gallery`);
//             }
//         }

//         // POPULATE RELATIONS
//         await media.populate('district', 'name slug');
//         await media.populate('gramPanchayat', 'name slug');
//         await media.populate('uploadedBy', 'name email role');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Media uploaded successfully",
//                 media
//             },
//             { status: 201 }
//         );

//     } catch (error) {
//         console.error("Upload Media Error:", error);
        
//         // More specific error messages
//         if (error.message.includes('Invalid cloud_name')) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Cloudinary configuration error. Please check your credentials." 
//                 },
//                 { status: 500 }
//             );
//         }
        
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

