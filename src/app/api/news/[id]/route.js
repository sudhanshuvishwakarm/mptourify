// GET, UPDATE, DELETE NEWS BY ID
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import News from "@/models/newsModel.js";
import mongoose from "mongoose";
import cloudinary from "@/config/cloudinary.js";

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
            .populate('relatedDistrict', 'name slug')
            .populate('relatedPanchayat', 'name slug');

        if (!news) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "News not found" 
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
        const { isAdmin: hasAdminRole } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can update news." 
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
                    message: "News not found" 
                },
                { status: 404 }
            );
        }

        // Check if request is form data (file upload) or JSON
        const contentType = request.headers.get('content-type');
        
        let updateData;

        if (contentType && contentType.includes('multipart/form-data')) {
            // Handle form data with file upload
            const formData = await request.formData();
            
            // Extract file and other form data
            const file = formData.get('featuredImage');
            const fileUrl = formData.get('featuredImageUrl');
            const uploadMethod = formData.get('uploadMethod') || 'file';
            let featuredImageUrl = existingNews.featuredImage;

            // Handle image upload if new image is provided
            if (uploadMethod === 'file' && file) {
                // VALIDATE FILE SIZE (max 50MB)
                const maxSize = 50 * 1024 * 1024;
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

                // Delete old image from Cloudinary if it exists
                if (existingNews.featuredImage && existingNews.featuredImage.includes('cloudinary')) {
                    try {
                        const publicId = existingNews.featuredImage.split('/').pop().split('.')[0];
                        const fullPublicId = `mptourify/news/${publicId}`;
                        await cloudinary.uploader.destroy(fullPublicId);
                    } catch (error) {
                        console.error("Error deleting old image:", error);
                        // Continue with upload even if deletion fails
                    }
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
                
                // Delete old image from Cloudinary if it exists and new image is URL
                if (existingNews.featuredImage && 
                    existingNews.featuredImage !== fileUrl && 
                    existingNews.featuredImage.includes('cloudinary')) {
                    try {
                        const publicId = existingNews.featuredImage.split('/').pop().split('.')[0];
                        const fullPublicId = `mptourify/news/${publicId}`;
                        await cloudinary.uploader.destroy(fullPublicId);
                    } catch (error) {
                        console.error("Error deleting old image:", error);
                    }
                }
            }

            // Parse other form data
            updateData = {
                title: formData.get('title') || existingNews.title,
                slug: formData.get('slug') || existingNews.slug,
                content: formData.get('content') || existingNews.content,
                excerpt: formData.get('excerpt') || existingNews.excerpt,
                featuredImage: featuredImageUrl,
                category: formData.get('category') || existingNews.category,
                status: formData.get('status') || existingNews.status,
                relatedDistrict: formData.get('relatedDistrict') || existingNews.relatedDistrict,
                relatedPanchayat: formData.get('relatedPanchayat') || existingNews.relatedPanchayat,
                publishDate: formData.get('publishDate') || existingNews.publishDate
            };

            // Parse array fields - only update if provided
            const tags = formData.get('tags');
            if (tags !== null) {
                updateData.tags = tags 
                    ? tags.split(',').map(item => item.trim()).filter(item => item)
                    : [];
            }

        } else {
            // Handle JSON data
            updateData = await request.json();
        }

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
                        message: "News with this slug already exists" 
                    },
                    { status: 409 }
                );
            }
            updateData.slug = updateData.slug.toLowerCase();
        }

        // IF TITLE IS BEING UPDATED, CHECK FOR DUPLICATES
        if (updateData.title && updateData.title !== existingNews.title) {
            const duplicateTitle = await News.findOne({ 
                title: updateData.title,
                _id: { $ne: id }
            });

            if (duplicateTitle) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "News with this title already exists" 
                    },
                    { status: 409 }
                );
            }
        }

        // Clean up updateData - remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

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
                message: "News updated successfully",
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
        const { isAdmin: hasAdminRole } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can delete news." 
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
                    message: "News not found" 
                },
                { status: 404 }
            );
        }

        // Delete featured image from Cloudinary if it exists
        if (news.featuredImage && news.featuredImage.includes('cloudinary')) {
            try {
                const publicId = news.featuredImage.split('/').pop().split('.')[0];
                const fullPublicId = `mptourify/news/${publicId}`;
                await cloudinary.uploader.destroy(fullPublicId);
            } catch (error) {
                console.error("Error deleting image:", error);
                // Continue with deletion even if image removal fails
            }
        }

        // Delete the news
        await News.findByIdAndDelete(id);

        return NextResponse.json(
            { 
                success: true,
                message: "News deleted successfully",
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
// // GET, UPDATE, DELETE NEWS BY ID
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { getAdmin } from "@/utils/getAdmin.js";
// import News from "@/models/newsModel.js";
// import Admin from "@/models/adminModel.js";
// import District from "@/models/districtModel.js";
// import GramPanchayat from "@/models/panchayatModel.js";
// import mongoose from "mongoose";

// connectDB();

// // GET NEWS BY ID
// export async function GET(request, context) {
//     try {
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid news ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // FIND NEWS
//         const news = await News.findById(id)
//             .populate('author', 'name email')
//             .populate('relatedDistrict', 'name slug headerImage')
//             .populate('relatedPanchayat', 'name slug district');

//         if (!news) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "News article not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // ONLY SHOW PUBLISHED NEWS TO PUBLIC
//         const currentAdmin = await getAdmin();
//         if (!currentAdmin && news.status !== 'published') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "News article not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         return NextResponse.json(
//             { 
//                 success: true,
//                 news
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get News Error:", error);
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

// // UPDATE NEWS BY ID
// export async function PUT(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can update news articles." 
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
//                     message: "Invalid news ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF NEWS EXISTS
//         const existingNews = await News.findById(id);
//         if (!existingNews) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "News article not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         const updateData = await request.json();

//         // IF SLUG IS BEING UPDATED, CHECK FOR DUPLICATES
//         if (updateData.slug && updateData.slug !== existingNews.slug) {
//             const duplicateSlug = await News.findOne({ 
//                 slug: updateData.slug.toLowerCase(),
//                 _id: { $ne: id }
//             });

//             if (duplicateSlug) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "News article with this slug already exists" 
//                     },
//                     { status: 409 }
//                 );
//             }
//         }

//         // VALIDATE CATEGORY IF PROVIDED
//         if (updateData.category) {
//             const validCategories = ['media_coverage', 'press_release', 'announcement', 'update'];
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

//         // VALIDATE STATUS IF PROVIDED
//         if (updateData.status) {
//             const validStatuses = ['published', 'draft', 'scheduled'];
//             if (!validStatuses.includes(updateData.status)) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
//                     },
//                     { status: 400 }
//                 );
//             }
//         }

//         // UPDATE NEWS
//         const updatedNews = await News.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         )
//         .populate('author', 'name email')
//         .populate('relatedDistrict', 'name slug')
//         .populate('relatedPanchayat', 'name slug');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "News article updated successfully",
//                 news: updatedNews
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Update News Error:", error);
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

// // DELETE NEWS BY ID
// export async function DELETE(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin || currentAdmin.role !== 'admin') {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can delete news articles." 
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
//                     message: "Invalid news ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF NEWS EXISTS
//         const news = await News.findById(id);
//         if (!news) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "News article not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // DELETE NEWS (No cascade needed - news doesn't have foreign key references elsewhere)
//         await News.findByIdAndDelete(id);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "News article deleted successfully",
//                 deletedNews: {
//                     id: news._id,
//                     title: news.title,
//                     slug: news.slug
//                 }
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Delete News Error:", error);
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