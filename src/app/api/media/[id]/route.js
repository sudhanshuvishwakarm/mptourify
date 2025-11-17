// GET, UPDATE, DELETE MEDIA BY ID
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { checkRole, getAdmin } from "@/utils/getAdmin.js";
import Media from "@/models/mediaModel.js";
import Admin from "@/models/adminModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
import cloudinary from "@/config/cloudinary.js";
import mongoose from "mongoose";

connectDB();

// GET MEDIA BY ID
export async function GET(request, context) {
    try {
        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid media ID" 
                },
                { status: 400 }
            );
        }

        // FIND MEDIA
        const media = await Media.findById(id)
            .populate('district', 'name slug headerImage')
            .populate('gramPanchayat', 'name slug district')
            .populate('uploadedBy', 'name email role');

        if (!media) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Media not found" 
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true,
                media
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Media Error:", error);
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

// UPDATE MEDIA DETAILS
export async function PUT(request, context) {
    try {
        // CHECK IF USER HAS ACCESS (ADMIN OR RTC)
        const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

        if (!hasAccess) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins and RTCs can update media." 
                },
                { status: 403 }
            );
        }

        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid media ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF MEDIA EXISTS
        const existingMedia = await Media.findById(id);
        if (!existingMedia) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Media not found" 
                },
                { status: 404 }
            );
        }

        // IF RTC, CHECK OWNERSHIP
        if (currentAdmin.role === 'rtc') {
            if (existingMedia.uploadedBy.toString() !== currentAdmin._id.toString()) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "You can only edit media uploaded by you" 
                    },
                    { status: 403 }
                );
            }
        }

        const updateData = await request.json();

        // VALIDATE CATEGORY IF PROVIDED
        if (updateData.category) {
            const validCategories = ['heritage', 'natural', 'cultural', 'event', 'festival'];
            if (!validCategories.includes(updateData.category)) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
                    },
                    { status: 400 }
                );
            }
        }

        // Handle tags conversion if provided
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        // UPDATE MEDIA
        const updatedMedia = await Media.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('district', 'name slug')
        .populate('gramPanchayat', 'name slug')
        .populate('uploadedBy', 'name email role');

        return NextResponse.json(
            { 
                success: true,
                message: "Media updated successfully",
                media: updatedMedia
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Media Error:", error);
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

// DELETE MEDIA
// DELETE MEDIA
export async function DELETE(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can delete media." 
                },
                { status: 403 }
            );
        }

        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid media ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF MEDIA EXISTS
        const media = await Media.findById(id);
        if (!media) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Media not found" 
                },
                { status: 404 }
            );
        }

        // CASCADE DELETE: REMOVE MEDIA FROM PANCHAYAT GALLERIES
        if (media.gramPanchayat) {
            await GramPanchayat.findByIdAndUpdate(
                media.gramPanchayat,
                { 
                    $pull: { 
                        mediaGallery: id
                    }
                }
            );
        }

        // Also remove from any panchayat that might have this media in galleries
        await GramPanchayat.updateMany(
            { mediaGallery: id },
            { 
                $pull: { 
                    mediaGallery: id
                }
            }
        );

        // DELETE FROM CLOUDINARY - IMPROVED EXTRACTION
        try {
            const url = media.fileUrl;
            let publicId;
            
            console.log('Original URL:', url);

            // Extract public_id from Cloudinary URL
            if (url.includes('cloudinary.com')) {
                // Cloudinary URL formats:
                // 1. https://res.cloudinary.com/cloudname/image/upload/v1234567/folder/public_id.jpg
                // 2. https://res.cloudinary.com/cloudname/image/upload/folder/public_id.jpg
                // 3. https://res.cloudinary.com/cloudname/video/upload/v1234567/folder/public_id.mp4
                
                // Split URL and find the important parts
                const parts = url.split('/');
                
                // Find index of 'upload'
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
                    
                    console.log('Extracted publicId:', publicId);
                }
            }

            // If extraction failed, try simple method
            if (!publicId) {
                const filename = url.split('/').pop();
                publicId = filename.split('.')[0];
                console.log('Fallback publicId:', publicId);
            }

            if (publicId) {
                // Determine resource type
                const resourceType = media.fileType === 'video' ? 'video' : 'image';
                
                console.log(`Deleting from Cloudinary:`, {
                    publicId,
                    resourceType,
                    mediaType: media.fileType
                });

                // Delete from Cloudinary
                const result = await cloudinary.uploader.destroy(publicId, {
                    resource_type: resourceType,
                    invalidate: true // CDN cache invalidation
                });

                console.log('Cloudinary API Response:', result);

                if (result.result === 'ok') {
                    console.log(`✅ Successfully deleted from Cloudinary: ${publicId}`);
                } else if (result.result === 'not found') {
                    console.warn(`❌ File not found in Cloudinary: ${publicId}`);
                } else {
                    console.warn(`⚠️ Cloudinary response: ${result.result}`);
                }
            } else {
                console.error('❌ Could not extract publicId from URL:', url);
            }

        } catch (cloudinaryError) {
            console.error("❌ Cloudinary deletion error:", cloudinaryError);
            // Continue with database deletion even if Cloudinary fails
        }

        // DELETE FROM DATABASE
        await Media.findByIdAndDelete(id);

        return NextResponse.json(
            { 
                success: true,
                message: "Media deleted successfully",
                deletedMedia: {
                    id: media._id,
                    title: media.title,
                    fileType: media.fileType
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete Media Error:", error);
        return NextResponse.json(
            { 
                success: false,
                message: "Internal Server Error",
                error: error.message 
            },
            { status: 500 }
        );
    }
}// export async function DELETE(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can delete media." 
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
//                     message: "Invalid media ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF MEDIA EXISTS
//         const media = await Media.findById(id);
//         if (!media) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Media not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // CASCADE DELETE: REMOVE MEDIA FROM PANCHAYAT GALLERIES
//       if (media.gramPanchayat) {
//     await GramPanchayat.findByIdAndUpdate(
//         media.gramPanchayat,
//         { 
//             $pull: { 
//                 mediaGallery: id
//             }
//         }
//     );
// }

// // Also remove from any panchayat that might have this media in galleries
// await GramPanchayat.updateMany(
//     { mediaGallery: id },
//     { 
//         $pull: { 
//             mediaGallery: id
//         }
//     }
// );

//         // DELETE FROM CLOUDINARY
//         try {
//             // Extract public_id from Cloudinary URL
//             const urlParts = media.fileUrl.split('/');
//             const publicIdWithExtension = urlParts[urlParts.length - 1];
//             const publicId = publicIdWithExtension.split('.')[0];
//             const folder = 'mptourify';
            
//             const fullPublicId = `${folder}/${publicId}`;
            
//             await cloudinary.uploader.destroy(fullPublicId, {
//                 resource_type: media.fileType === 'video' ? 'video' : 'image'
//             });
            
//             console.log(`Successfully deleted from Cloudinary: ${fullPublicId}`);
//         } catch (cloudinaryError) {
//             console.error("Cloudinary deletion error:", cloudinaryError);
//             // Continue with database deletion even if Cloudinary fails
//         }

//         // DELETE FROM DATABASE
//         await Media.findByIdAndDelete(id);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Media deleted successfully",
//                 deletedMedia: {
//                     id: media._id,
//                     title: media.title,
//                     fileType: media.fileType
//                 }
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Delete Media Error:", error);
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
// // GET, UPDATE, DELETE MEDIA BY ID
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { checkRole, getAdmin } from "@/utils/getAdmin.js";
// import Media from "@/models/mediaModel.js";
// import Admin from "@/models/adminModel.js";
// import GramPanchayat from "@/models/panchayatModel.js";
// import cloudinary from "@/config/cloudinary.js";
// import mongoose from "mongoose";

// connectDB();

// // GET MEDIA BY ID
// export async function GET(request, context) {
//     try {
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid media ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // FIND MEDIA
//         const media = await Media.findById(id)
//             .populate('district', 'name slug headerImage')
//             .populate('gramPanchayat', 'name slug district')
//             .populate('uploadedBy', 'name email role');

//         if (!media) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Media not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         return NextResponse.json(
//             { 
//                 success: true,
//                 media
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get Media Error:", error);
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

// // UPDATE MEDIA DETAILS
// export async function PUT(request, context) {
//     try {
//         // CHECK IF USER HAS ACCESS (ADMIN OR RTC)
//         const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

//         if (!hasAccess) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins and RTCs can update media." 
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
//                     message: "Invalid media ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF MEDIA EXISTS
//         const existingMedia = await Media.findById(id);
//         if (!existingMedia) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Media not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // IF RTC, CHECK OWNERSHIP
//         if (currentAdmin.role === 'rtc') {
//             if (existingMedia.uploadedBy.toString() !== currentAdmin._id.toString()) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "You can only edit media uploaded by you" 
//                     },
//                     { status: 403 }
//                 );
//             }
//         }

//         const updateData = await request.json();

//         // VALIDATE CATEGORY IF PROVIDED
//         if (updateData.category) {
//             const validCategories = ['heritage', 'natural', 'cultural', 'event', 'festival'];
//             if (!validCategories.includes(updateData.category)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
//                     },
//                     { status: 400 }
//                 );
//             }
//         }

//         // UPDATE MEDIA
//         const updatedMedia = await Media.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         )
//         .populate('district', 'name slug')
//         .populate('gramPanchayat', 'name slug')
//         .populate('uploadedBy', 'name email role');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Media updated successfully",
//                 media: updatedMedia
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Update Media Error:", error);
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

// // DELETE MEDIA
// export async function DELETE(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can delete media." 
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
//                     message: "Invalid media ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF MEDIA EXISTS
//         const media = await Media.findById(id);
//         if (!media) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Media not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // CASCADE DELETE: REMOVE MEDIA FROM PANCHAYAT GALLERIES
//         await GramPanchayat.updateMany(
//             { $or: [
//                 { photoGallery: id },
//                 { videoGallery: id }
//             ]},
//             { 
//                 $pull: { 
//                     photoGallery: id,
//                     videoGallery: id 
//                 }
//             }
//         );

//         // DELETE FROM CLOUDINARY
//         try {
//             const publicId = media.fileUrl.split('/').slice(-2).join('/').split('.')[0];
//             await cloudinary.uploader.destroy(publicId, {
//                 resource_type: media.fileType
//             });
//         } catch (cloudinaryError) {
//             console.error("Cloudinary deletion error:", cloudinaryError);
//             // Continue with database deletion even if Cloudinary fails
//         }

//         // DELETE FROM DATABASE
//         await Media.findByIdAndDelete(id);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Media deleted successfully",
//                 deletedMedia: {
//                     id: media._id,
//                     title: media.title,
//                     fileType: media.fileType
//                 }
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Delete Media Error:", error);
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