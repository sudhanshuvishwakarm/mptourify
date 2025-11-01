// GET, UPDATE, DELETE NEWS BY ID
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import News from "@/models/newsModel.js";
import Admin from "@/models/adminModel.js";
import District from "@/models/districtModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
import mongoose from "mongoose";

connectDB();

// GET NEWS BY ID
export async function GET(request, context) {
    try {
        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid news ID" 
                },
                { status: 400 }
            );
        }

        // FIND NEWS
        const news = await News.findById(id)
            .populate('author', 'name email')
            .populate('relatedDistrict', 'name slug headerImage')
            .populate('relatedPanchayat', 'name slug district');

        if (!news) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News article not found" 
                },
                { status: 404 }
            );
        }

        // ONLY SHOW PUBLISHED NEWS TO PUBLIC
        const currentAdmin = await getAdmin();
        if (!currentAdmin && news.status !== 'published') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News article not found" 
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true,
                news
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get News Error:", error);
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

// UPDATE NEWS BY ID
export async function PUT(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can update news articles." 
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
                    message: "Invalid news ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF NEWS EXISTS
        const existingNews = await News.findById(id);
        if (!existingNews) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News article not found" 
                },
                { status: 404 }
            );
        }

        const updateData = await request.json();

        // IF SLUG IS BEING UPDATED, CHECK FOR DUPLICATES
        if (updateData.slug && updateData.slug !== existingNews.slug) {
            const duplicateSlug = await News.findOne({ 
                slug: updateData.slug.toLowerCase(),
                _id: { $ne: id }
            });

            if (duplicateSlug) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "News article with this slug already exists" 
                    },
                    { status: 409 }
                );
            }
        }

        // VALIDATE CATEGORY IF PROVIDED
        if (updateData.category) {
            const validCategories = ['media_coverage', 'press_release', 'announcement', 'update'];
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

        // VALIDATE STATUS IF PROVIDED
        if (updateData.status) {
            const validStatuses = ['published', 'draft', 'scheduled'];
            if (!validStatuses.includes(updateData.status)) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
                    },
                    { status: 400 }
                );
            }
        }

        // UPDATE NEWS
        const updatedNews = await News.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('author', 'name email')
        .populate('relatedDistrict', 'name slug')
        .populate('relatedPanchayat', 'name slug');

        return NextResponse.json(
            { 
                success: true,
                message: "News article updated successfully",
                news: updatedNews
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update News Error:", error);
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

// DELETE NEWS BY ID
export async function DELETE(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can delete news articles." 
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
                    message: "Invalid news ID" 
                },
                { status: 400 }
            );
        }

        // CHECK IF NEWS EXISTS
        const news = await News.findById(id);
        if (!news) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News article not found" 
                },
                { status: 404 }
            );
        }

        // DELETE NEWS (No cascade needed - news doesn't have foreign key references elsewhere)
        await News.findByIdAndDelete(id);

        return NextResponse.json(
            { 
                success: true,
                message: "News article deleted successfully",
                deletedNews: {
                    id: news._id,
                    title: news.title,
                    slug: news.slug
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete News Error:", error);
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