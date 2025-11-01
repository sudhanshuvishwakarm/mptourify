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
        await GramPanchayat.updateMany(
            { $or: [
                { photoGallery: id },
                { videoGallery: id }
            ]},
            { 
                $pull: { 
                    photoGallery: id,
                    videoGallery: id 
                }
            }
        );

        // DELETE FROM CLOUDINARY
        try {
            const publicId = media.fileUrl.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId, {
                resource_type: media.fileType
            });
        } catch (cloudinaryError) {
            console.error("Cloudinary deletion error:", cloudinaryError);
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
}