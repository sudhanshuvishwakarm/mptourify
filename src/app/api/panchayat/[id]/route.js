// GET, UPDATE, DELETE PANCHAYAT BY ID
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { checkRole, getAdmin } from "@/utils/getAdmin.js";
import Media from "@/models/mediaModel.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel.js";

connectDB();

// GET PANCHAYAT BY ID
export async function GET(request, context) {
    try {
        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid panchayat ID" 
                },
                { status: 400 }
            );
        }

        // FIND PANCHAYAT
        const panchayat = await GramPanchayat.findById(id)
            .populate('district', 'name slug headerImage coordinates')
            .populate('createdBy', 'name email role')
            .populate('photoGallery')
            .populate('videoGallery')
            .populate('rtcReport.coordinator', 'name email employeeId designation');

        if (!panchayat) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Gram Panchayat not found" 
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true,
                panchayat
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Panchayat Error:", error);
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

// UPDATE PANCHAYAT BY ID
export async function PUT(request, context) {
    try {
        // CHECK IF USER HAS ACCESS (ADMIN OR RTC)
        const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

        if (!hasAccess) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins and RTCs can update panchayats." 
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
                    message: "Invalid panchayat ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF PANCHAYAT EXISTS
        const existingPanchayat = await GramPanchayat.findById(id);
        if (!existingPanchayat) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Gram Panchayat not found" 
                },
                { status: 404 }
            );
        }

        // IF RTC, CHECK OWNERSHIP (RTC CAN ONLY EDIT THEIR OWN PANCHAYATS)
        if (currentAdmin.role === 'rtc') {
            if (existingPanchayat.createdBy.toString() !== currentAdmin._id.toString()) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "You can only edit panchayats created by you" 
                    },
                    { status: 403 }
                );
            }
        }

        const updateData = await request.json();

        // IF DISTRICT IS BEING UPDATED, VALIDATE IT
        if (updateData.district) {
            if (!mongoose.Types.ObjectId.isValid(updateData.district)) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Invalid district ID" 
                    },
                    { status: 400 }
                );
            }

            // IF RTC, CHECK IF NEW DISTRICT IS IN THEIR ASSIGNED DISTRICTS
            if (currentAdmin.role === 'rtc') {
                const hasDistrictAccess = currentAdmin.assignedDistricts.some(
                    d => d.toString() === updateData.district
                );

                if (!hasDistrictAccess) {
                    return NextResponse.json(
                        { 
                            success: false,
                            message: "You don't have access to move panchayat to this district" 
                        },
                        { status: 403 }
                    );
                }
            }
        }

        // IF SLUG IS BEING UPDATED, CHECK FOR DUPLICATES
        if (updateData.slug && updateData.slug !== existingPanchayat.slug) {
            const duplicateSlug = await GramPanchayat.findOne({ 
                slug: updateData.slug.toLowerCase(),
                district: updateData.district || existingPanchayat.district,
                _id: { $ne: id }
            });

            if (duplicateSlug) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Panchayat with this slug already exists in this district" 
                    },
                    { status: 409 }
                );
            }
        }

        // VALIDATE MEDIA IDs IF PROVIDED
        if (updateData.photoGallery && updateData.photoGallery.length > 0) {
            const validPhotos = updateData.photoGallery.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!validPhotos) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Invalid media IDs in photoGallery" 
                    },
                    { status: 400 }
                );
            }
        }

        if (updateData.videoGallery && updateData.videoGallery.length > 0) {
            const validVideos = updateData.videoGallery.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!validVideos) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Invalid media IDs in videoGallery" 
                    },
                    { status: 400 }
                );
            }
        }

        // UPDATE PANCHAYAT
        const updatedPanchayat = await GramPanchayat.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('district', 'name slug')
        .populate('createdBy', 'name email role')
        .populate('photoGallery')
        .populate('videoGallery');

        return NextResponse.json(
            { 
                success: true,
                message: "Gram Panchayat updated successfully",
                panchayat: updatedPanchayat
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Panchayat Error:", error);
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

// DELETE PANCHAYAT BY ID
export async function DELETE(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN (ONLY ADMIN CAN DELETE)
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can delete panchayats." 
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
                    message: "Invalid panchayat ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF PANCHAYAT EXISTS
        const panchayat = await GramPanchayat.findById(id);
        if (!panchayat) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Gram Panchayat not found" 
                },
                { status: 404 }
            );
        }

        // CASCADE DELETE: REMOVE PANCHAYAT REFERENCE FROM MEDIA
        if (panchayat.photoGallery && panchayat.photoGallery.length > 0) {
            await Media.updateMany(
                { _id: { $in: panchayat.photoGallery } },
                { $unset: { gramPanchayat: "" } }
            );
        }

        if (panchayat.videoGallery && panchayat.videoGallery.length > 0) {
            await Media.updateMany(
                { _id: { $in: panchayat.videoGallery } },
                { $unset: { gramPanchayat: "" } }
            );
        }

        // ALSO REMOVE PANCHAYAT REFERENCE FROM OTHER MEDIA THAT REFERENCE IT
        await Media.updateMany(
            { gramPanchayat: id },
            { $unset: { gramPanchayat: "" } }
        );

        // DELETE PANCHAYAT
        await GramPanchayat.findByIdAndDelete(id);

        return NextResponse.json(
            { 
                success: true,
                message: "Gram Panchayat deleted successfully",
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
            { 
                success: false,
                message: "Internal Server Error",
                error: error.message 
            },
            { status: 500 }
        );
    }
}