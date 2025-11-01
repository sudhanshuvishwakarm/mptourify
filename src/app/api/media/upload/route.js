// UPLOAD MEDIA (Photo/Video)

import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { checkRole } from "@/utils/getAdmin.js";
import Media from "@/models/mediaModel.js";
import District from "@/models/districtModel.js";
import cloudinary from "@/config/cloudinary.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel.js";
import Admin from "@/models/adminModel.js";

connectDB();

export async function POST(request) {
    try {
        // CHECK IF USER HAS ACCESS (ADMIN OR RTC)
        const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

        if (!hasAccess) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins and RTCs can upload media." 
                },
                { status: 403 }
            );
        }

        // GET FORM DATA
        const formData = await request.formData();
        const file = formData.get('file');
        const title = formData.get('title');
        const description = formData.get('description');
        const category = formData.get('category');
        const tags = formData.get('tags'); // Comma-separated string
        const districtId = formData.get('district');
        const panchayatId = formData.get('panchayat');
        const photographer = formData.get('photographer');
        const captureDate = formData.get('captureDate');

        // VALIDATE REQUIRED FIELDS
        if (!file || !title || !category) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide file, title, and category" 
                },
                { status: 400 }
            );
        }

        // VALIDATE CATEGORY
        const validCategories = ['heritage', 'natural', 'cultural', 'event', 'festival'];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
                },
                { status: 400 }
            );
        }

        // VALIDATE FILE SIZE (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "File size exceeds 50MB limit" 
                },
                { status: 400 }
            );
        }

        // VALIDATE DISTRICT IF PROVIDED
        if (districtId) {
            if (!mongoose.Types.ObjectId.isValid(districtId)) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Invalid district ID" 
                    },
                    { status: 400 }
                );
            }

            const districtExists = await District.findById(districtId);
            if (!districtExists) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "District not found" 
                    },
                    { status: 404 }
                );
            }

            // IF RTC, CHECK DISTRICT ACCESS
            if (currentAdmin.role === 'rtc') {
                const hasDistrictAccess = currentAdmin.assignedDistricts.some(
                    d => d.toString() === districtId
                );

                if (!hasDistrictAccess) {
                    return NextResponse.json(
                        { 
                            success: false,
                            message: "You don't have access to upload media for this district" 
                        },
                        { status: 403 }
                    );
                }
            }
        }

        // VALIDATE PANCHAYAT IF PROVIDED
        if (panchayatId) {
            if (!mongoose.Types.ObjectId.isValid(panchayatId)) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Invalid panchayat ID" 
                    },
                    { status: 400 }
                );
            }

            const panchayatExists = await GramPanchayat.findById(panchayatId);
            if (!panchayatExists) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Panchayat not found" 
                    },
                    { status: 404 }
                );
            }
        }

        // CONVERT FILE TO BUFFER
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // DETERMINE FILE TYPE
        const fileType = file.type.startsWith('video/') ? 'video' : 'image';

        // UPLOAD TO CLOUDINARY
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'mp-tourify',
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

        // CREATE THUMBNAIL URL
        let thumbnailUrl = uploadResult.secure_url;
        if (fileType === 'video') {
            // For video, create thumbnail from first frame
            thumbnailUrl = cloudinary.url(uploadResult.public_id, {
                resource_type: 'video',
                format: 'jpg',
                transformation: [
                    { width: 640, height: 360, crop: 'fill' }
                ]
            });
        }

        // PARSE TAGS
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

        // CREATE MEDIA DOCUMENT
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
            status: currentAdmin.role === 'admin' ? 'approved' : 'pending', // Auto-approve for admin
            uploadedBy: currentAdmin._id
        });

        // POPULATE RELATIONS
        await media.populate('district', 'name slug');
        await media.populate('gramPanchayat', 'name slug');
        await media.populate('uploadedBy', 'name email role');

        return NextResponse.json(
            { 
                success: true,
                message: "Media uploaded successfully",
                media
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Upload Media Error:", error);
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

// Configure to handle file uploads (Next.js 15+)
export const config = {
    api: {
        bodyParser: false, // Disable body parsing for file uploads
    },
};