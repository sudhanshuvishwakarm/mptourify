// CREATE & GET ALL NEWS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import News from "@/models/newsModel.js";
import District from "@/models/districtModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
import Admin from "@/models/adminModel.js";
import mongoose from "mongoose";

connectDB();

// CREATE NEWS ARTICLE
export async function POST(request) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can create news articles." 
                },
                { status: 403 }
            );
        }

        const newsData = await request.json();
        const { 
            title,
            slug,
            content,
            excerpt,
            featuredImage,
            category,
            tags,
            relatedDistrict,
            relatedPanchayat,
            publishDate,
            status,
            featured
        } = newsData;

        // VALIDATE REQUIRED FIELDS
        if (!title || !slug || !content || !excerpt || !featuredImage || !category) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide required fields: title, slug, content, excerpt, featuredImage, category" 
                },
                { status: 400 }
            );
        }

        // VALIDATE CATEGORY
        const validCategories = ['media_coverage', 'press_release', 'announcement', 'update'];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
                },
                { status: 400 }
            );
        }

        // CHECK IF SLUG ALREADY EXISTS
        const existingNews = await News.findOne({ slug: slug.toLowerCase() });
        if (existingNews) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News article with this slug already exists" 
                },
                { status: 409 }
            );
        }

        // VALIDATE DISTRICT IF PROVIDED
        if (relatedDistrict) {
            if (!mongoose.Types.ObjectId.isValid(relatedDistrict)) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Invalid district ID" 
                    },
                    { status: 400 }
                );
            }

            const districtExists = await District.findById(relatedDistrict);
            if (!districtExists) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "District not found" 
                    },
                    { status: 404 }
                );
            }
        }

        // VALIDATE PANCHAYAT IF PROVIDED
        if (relatedPanchayat) {
            if (!mongoose.Types.ObjectId.isValid(relatedPanchayat)) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Invalid panchayat ID" 
                    },
                    { status: 400 }
                );
            }

            const panchayatExists = await GramPanchayat.findById(relatedPanchayat);
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

        // VALIDATE STATUS
        const validStatuses = ['published', 'draft'];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
                },
                { status: 400 }
            );
        }

        // CREATE NEWS
        const news = await News.create({
            title,
            slug: slug.toLowerCase(),
            content,
            excerpt,
            featuredImage,
            category,
            tags: tags || [],
            relatedDistrict: relatedDistrict || null,
            relatedPanchayat: relatedPanchayat || null,
            publishDate: publishDate || new Date(),
            status: status || 'draft',
            featured: featured || false,
            author: currentAdmin._id
        });

        // POPULATE RELATIONS
        await news.populate('author', 'name email');
        await news.populate('relatedDistrict', 'name slug');
        await news.populate('relatedPanchayat', 'name slug');

        return NextResponse.json(
            { 
                success: true,
                message: "News article created successfully",
                news
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create News Error:", error);
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

// GET ALL PUBLISHED NEWS
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // QUERY PARAMETERS
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const featured = searchParams.get('featured');
        const district = searchParams.get('district');
        const search = searchParams.get('search');
        const tag = searchParams.get('tag');
        const sort = searchParams.get('sort') || 'publishDate';
        const order = searchParams.get('order') || 'desc';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        // BUILD QUERY
        let query = {};
        
        // Default: only show published news for public
        if (status && ['published', 'draft'].includes(status)) {
            query.status = status;
        } 
        // else {
        //     query.status = 'published';
        // }
        
        if (category) {
            query.category = category;
        }
        
        if (featured === 'true') {
            query.featured = true;
        }
        
        if (district && mongoose.Types.ObjectId.isValid(district)) {
            query.relatedDistrict = district;
        }
        
        if (tag) {
            query.tags = { $in: [tag] };
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        // BUILD SORT
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sort]: sortOrder };

        // CALCULATE PAGINATION
        const skip = (page - 1) * limit;

        // FETCH NEWS
        const news = await News.find(query)
            .select('title slug excerpt featuredImage category tags publishDate status featured createdAt')
            .populate('author', 'name email')
            .populate('relatedDistrict', 'name slug')
            .populate('relatedPanchayat', 'name slug')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        // GET TOTAL COUNT
        const totalNews = await News.countDocuments(query);
        const totalPages = Math.ceil(totalNews / limit);

        return NextResponse.json(
            { 
                success: true,
                count: news.length,
                totalNews,
                currentPage: page,
                totalPages,
                news
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get All News Error:", error);
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