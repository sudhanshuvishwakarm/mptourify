// GET, UPDATE, DELETE DISTRICT BY ID
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import District from "@/models/districtModel.js";
import mongoose from "mongoose";

connectDB();

// GET DISTRICT BY ID
export async function GET(request, context) {
    try {
        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid district ID" 
                },
                { status: 400 }
            );
        }

        // FIND DISTRICT
        const district = await District.findById(id)
            .populate('createdBy', 'name email');

        if (!district) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "District not found" 
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true,
                district
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get District Error:", error);
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

// UPDATE DISTRICT BY ID
export async function PUT(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can update districts." 
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
                    message: "Invalid district ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF DISTRICT EXISTS
        const existingDistrict = await District.findById(id);
        if (!existingDistrict) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "District not found" 
                },
                { status: 404 }
            );
        }

        const updateData = await request.json();

        // IF SLUG IS BEING UPDATED, CHECK FOR DUPLICATES
        if (updateData.slug && updateData.slug !== existingDistrict.slug) {
            const duplicateSlug = await District.findOne({ 
                slug: updateData.slug.toLowerCase(),
                _id: { $ne: id }
            });

            if (duplicateSlug) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "District with this slug already exists" 
                    },
                    { status: 409 }
                );
            }
        }

        // IF NAME IS BEING UPDATED, CHECK FOR DUPLICATES
        if (updateData.name && updateData.name !== existingDistrict.name) {
            const duplicateName = await District.findOne({ 
                name: updateData.name,
                _id: { $ne: id }
            });

            if (duplicateName) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "District with this name already exists" 
                    },
                    { status: 409 }
                );
            }
        }

        // UPDATE DISTRICT
        const updatedDistrict = await District.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        return NextResponse.json(
            { 
                success: true,
                message: "District updated successfully",
                district: updatedDistrict
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update District Error:", error);
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

// DELETE DISTRICT BY ID
export async function DELETE(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can delete districts." 
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
                    message: "Invalid district ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF DISTRICT EXISTS
        const district = await District.findById(id);
        if (!district) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "District not found" 
                },
                { status: 404 }
            );
        }

        // CHECK IF DISTRICT HAS PANCHAYATS
        const GramPanchayat = (await import("@/models/panchayatModel.js")).default;
        const panchayatCount = await GramPanchayat.countDocuments({ district: id });

        if (panchayatCount > 0) {
            return NextResponse.json(
                { 
                    success: false,
                    message: `Cannot delete district. It has ${panchayatCount} gram panchayats associated with it.` 
                },
                { status: 400 }
            );
        }

        // DELETE DISTRICT
        await District.findByIdAndDelete(id);

        return NextResponse.json(
            { 
                success: true,
                message: "District deleted successfully",
                deletedDistrict: {
                    id: district._id,
                    name: district.name,
                    slug: district.slug
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete District Error:", error);
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