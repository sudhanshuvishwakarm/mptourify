// CREATE & GET ALL NEWS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import News from "@/models/newsModel.js";
import cloudinary from "@/config/cloudinary.js";
import District from "@/models/districtModel";
import GramPanchayat from "@/models/panchayatModel";


connectDB();
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// CREATE NEW NEWS
export async function POST(request) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can create news." 
                },
                { status: 403 }
            );
        }

        // Check if request is form data (file upload) or JSON
        const contentType = request.headers.get('content-type');
        
        let newsData;
        let featuredImageUrl;

        if (contentType && contentType.includes('multipart/form-data')) {
            // Handle form data with file upload
            const formData = await request.formData();
            
            // Extract file and other form data
            const file = formData.get('featuredImage');
            const fileUrl = formData.get('featuredImageUrl');
            const uploadMethod = formData.get('uploadMethod') || 'file';

            // Handle image upload
            if (uploadMethod === 'file' && file) {
                // VALIDATE FILE SIZE (Max 95MB)
                const maxSize = 95 * 1024 * 1024;
                if (file.size > maxSize) {
                    return NextResponse.json(
                        { 
                            success: false,
                            message: "File size exceeds 50MB limit" 
                        },
                        { status: 400 }
                    );
                }

                // VALIDATE FILE TYPE
                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    return NextResponse.json(
                        { 
                            success: false,
                            message: "Please select a valid image file (JPEG, PNG, WebP)" 
                        },
                        { status: 400 }
                    );
                }

                // CONVERT FILE TO BUFFER
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // UPLOAD TO CLOUDINARY WITH NEWS FOLDER
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'mptourify/news',
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

                featuredImageUrl = uploadResult.secure_url;
            } else if (uploadMethod === 'url' && fileUrl) {
                // Use provided URL
                featuredImageUrl = fileUrl;
            } else {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Please provide either a file or image URL" 
                    },
                    { status: 400 }
                );
            }

            // Parse other form data
            newsData = {
                title: formData.get('title'),
                slug: formData.get('slug'),
                content: formData.get('content'),
                excerpt: formData.get('excerpt'),
                featuredImage: featuredImageUrl,
                category: formData.get('category'),
                status: formData.get('status') || 'draft',
                relatedDistrict: formData.get('relatedDistrict') || null,
                relatedPanchayat: formData.get('relatedPanchayat') || null,
                publishDate: formData.get('publishDate') || new Date(),
                // Parse array fields
                tags: formData.get('tags')?.split(',').map(item => item.trim()).filter(item => item) || []
            };
        } else {
            // Handle JSON data (existing functionality)
            newsData = await request.json();
        }

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
            status
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

        // CHECK IF NEWS WITH SLUG ALREADY EXISTS
        const existingNews = await News.findOne({ 
            $or: [
                { slug: slug.toLowerCase() },
                { title: title }
            ]
        });

        if (existingNews) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News with this title or slug already exists" 
                },
                { status: 409 }
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
            author: currentAdmin._id
        });

        return NextResponse.json(
            { 
                success: true,
                message: "News created successfully",
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

// GET ALL NEWS
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        
        // QUERY PARAMETERS
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'publishDate';
        const order = searchParams.get('order') || 'desc';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        // BUILD QUERY
        let query = {};
        
        if (status && ['published', 'draft'].includes(status)) {
            query.status = status;
        }
        
        if (category) {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        // BUILD SORT
        let sortObj = {};
        sortObj[sort] = order === 'desc' ? -1 : 1;

        // CALCULATE PAGINATION
        const skip = (page - 1) * limit;

        // FETCH NEWS
        const news = await News.find(query)
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
}// // CREATE & GET ALL NEWS
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { getAdmin } from "@/utils/getAdmin.js";
// import News from "@/models/newsModel.js";
// import District from "@/models/districtModel.js";
// import GramPanchayat from "@/models/panchayatModel.js";
// import Admin from "@/models/adminModel.js";
// import mongoose from "mongoose";

// connectDB();

// // CREATE NEWS ARTICLE
// export async function POST(request) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can create news articles." 
//                 },
//                 { status: 403 }
//             );
//         }

//         const newsData = await request.json();
//         const { 
//             title,
//             slug,
//             content,
//             excerpt,
//             featuredImage,
//             category,
//             tags,
//             relatedDistrict,
//             relatedPanchayat,
//             publishDate,
//             status,
//             featured
//         } = newsData;

//         // VALIDATE REQUIRED FIELDS
//         if (!title || !slug || !content || !excerpt || !featuredImage || !category) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Please provide required fields: title, slug, content, excerpt, featuredImage, category" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE CATEGORY
//         const validCategories = ['media_coverage', 'press_release', 'announcement', 'update'];
//         if (!validCategories.includes(category)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF SLUG ALREADY EXISTS
//         const existingNews = await News.findOne({ slug: slug.toLowerCase() });
//         if (existingNews) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "News article with this slug already exists" 
//                 },
//                 { status: 409 }
//             );
//         }

//         // VALIDATE DISTRICT IF PROVIDED
//         if (relatedDistrict) {
//             if (!mongoose.Types.ObjectId.isValid(relatedDistrict)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid district ID" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             const districtExists = await District.findById(relatedDistrict);
//             if (!districtExists) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "District not found" 
//                     },
//                     { status: 404 }
//                 );
//             }
//         }

//         // VALIDATE PANCHAYAT IF PROVIDED
//         if (relatedPanchayat) {
//             if (!mongoose.Types.ObjectId.isValid(relatedPanchayat)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Invalid panchayat ID" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             const panchayatExists = await GramPanchayat.findById(relatedPanchayat);
//             if (!panchayatExists) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Panchayat not found" 
//                     },
//                     { status: 404 }
//                 );
//             }
//         }

//         // VALIDATE STATUS
//         const validStatuses = ['published', 'draft'];
//         if (status && !validStatuses.includes(status)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CREATE NEWS
//         const news = await News.create({
//             title,
//             slug: slug.toLowerCase(),
//             content,
//             excerpt,
//             featuredImage,
//             category,
//             tags: tags || [],
//             relatedDistrict: relatedDistrict || null,
//             relatedPanchayat: relatedPanchayat || null,
//             publishDate: publishDate || new Date(),
//             status: status || 'draft',
//             featured: featured || false,
//             author: currentAdmin._id
//         });

//         // POPULATE RELATIONS
//         await news.populate('author', 'name email');
//         await news.populate('relatedDistrict', 'name slug');
//         await news.populate('relatedPanchayat', 'name slug');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "News article created successfully",
//                 news
//             },
//             { status: 201 }
//         );

//     } catch (error) {
//         console.error("Create News Error:", error);
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

// // GET ALL PUBLISHED NEWS
// export async function GET(request) {
//     try {
//         const { searchParams } = new URL(request.url);
        
//         // QUERY PARAMETERS
//         const category = searchParams.get('category');
//         const status = searchParams.get('status');
//         const featured = searchParams.get('featured');
//         const district = searchParams.get('district');
//         const search = searchParams.get('search');
//         const tag = searchParams.get('tag');
//         const sort = searchParams.get('sort') || 'publishDate';
//         const order = searchParams.get('order') || 'desc';
//         const page = parseInt(searchParams.get('page')) || 1;
//         const limit = parseInt(searchParams.get('limit')) || 10;

//         // BUILD QUERY
//         let query = {};
        
//         // Default: only show published news for public
//         if (status && ['published', 'draft'].includes(status)) {
//             query.status = status;
//         } 
//         // else {
//         //     query.status = 'published';
//         // }
        
//         if (category) {
//             query.category = category;
//         }
        
//         if (featured === 'true') {
//             query.featured = true;
//         }
        
//         if (district && mongoose.Types.ObjectId.isValid(district)) {
//             query.relatedDistrict = district;
//         }
        
//         if (tag) {
//             query.tags = { $in: [tag] };
//         }
        
//         if (search) {
//             query.$or = [
//                 { title: { $regex: search, $options: 'i' } },
//                 { excerpt: { $regex: search, $options: 'i' } },
//                 { content: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // BUILD SORT
//         const sortOrder = order === 'desc' ? -1 : 1;
//         const sortObj = { [sort]: sortOrder };

//         // CALCULATE PAGINATION
//         const skip = (page - 1) * limit;

//         // FETCH NEWS
//         const news = await News.find(query)
//             .select('title slug excerpt featuredImage category tags publishDate status featured createdAt')
//             .populate('author', 'name email')
//             .populate('relatedDistrict', 'name slug')
//             .populate('relatedPanchayat', 'name slug')
//             .sort(sortObj)
//             .skip(skip)
//             .limit(limit);

//         // GET TOTAL COUNT
//         const totalNews = await News.countDocuments(query);
//         const totalPages = Math.ceil(totalNews / limit);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 count: news.length,
//                 totalNews,
//                 currentPage: page,
//                 totalPages,
//                 news
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get All News Error:", error);
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