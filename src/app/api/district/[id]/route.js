// GET, UPDATE, DELETE DISTRICT BY ID
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import District from "@/models/districtModel.js";
import mongoose from "mongoose";
import cloudinary from "@/config/cloudinary.js";

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

        // Check if request is form data (file upload) or JSON
        const contentType = request.headers.get('content-type');
        
        let updateData;

        if (contentType && contentType.includes('multipart/form-data')) {
            // Handle form data with file upload
            const formData = await request.formData();
            
            // Extract file and other form data
            const file = formData.get('headerImage');
            const fileUrl = formData.get('headerImageUrl');
            const uploadMethod = formData.get('uploadMethod') || 'file';
            let headerImageUrl = existingDistrict.headerImage;

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
                if (existingDistrict.headerImage) {
                    try {
                        const publicId = existingDistrict.headerImage.split('/').pop().split('.')[0];
                        const fullPublicId = `mptourify/district/${publicId}`;
                        await cloudinary.uploader.destroy(fullPublicId);
                    } catch (error) {
                        console.error("Error deleting old image:", error);
                        // Continue with upload even if deletion fails
                    }
                }

                // CONVERT FILE TO BUFFER
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // UPLOAD TO CLOUDINARY WITH DISTRICT FOLDER
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'mptourify/district',
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

                headerImageUrl = uploadResult.secure_url;
            } else if (uploadMethod === 'url' && fileUrl) {
                // Use provided URL
                headerImageUrl = fileUrl;
                
                // Delete old image from Cloudinary if it exists and new image is URL
                if (existingDistrict.headerImage && existingDistrict.headerImage !== fileUrl) {
                    try {
                        const publicId = existingDistrict.headerImage.split('/').pop().split('.')[0];
                        const fullPublicId = `mptourify/district/${publicId}`;
                        await cloudinary.uploader.destroy(fullPublicId);
                    } catch (error) {
                        console.error("Error deleting old image:", error);
                    }
                }
            }

            // Parse other form data
            updateData = {
                name: formData.get('name') || existingDistrict.name,
                slug: formData.get('slug') || existingDistrict.slug,
                headerImage: headerImageUrl,
                formationYear: formData.get('formationYear') || existingDistrict.formationYear,
                area: formData.get('area') || existingDistrict.area,
                population: formData.get('population') || existingDistrict.population,
                status: formData.get('status') || existingDistrict.status,
                historyAndCulture: formData.get('historyAndCulture') || existingDistrict.historyAndCulture
            };

            // Handle coordinates
            const lat = formData.get('coordinates[lat]');
            const lng = formData.get('coordinates[lng]');
            if (lat && lng) {
                updateData.coordinates = {
                    lat: parseFloat(lat),
                    lng: parseFloat(lng)
                };
            } else if (lat || lng) {
                // If only one coordinate is provided, merge with existing
                updateData.coordinates = {
                    lat: lat ? parseFloat(lat) : existingDistrict.coordinates.lat,
                    lng: lng ? parseFloat(lng) : existingDistrict.coordinates.lng
                };
            }

            // Parse array fields - only update if provided
            // const administrativeDivisions = formData.get('administrativeDivisions');
            // if (administrativeDivisions !== null) {
            //     updateData.administrativeDivisions = administrativeDivisions 
            //         ? administrativeDivisions.split(',').map(item => item.trim()).filter(item => item)
            //         : [];
            // }

            // const lokSabha = formData.get('politicalConstituencies[lokSabha]');
            // const vidhanSabha = formData.get('politicalConstituencies[vidhanSabha]');
            // if (lokSabha !== null || vidhanSabha !== null) {
            //     updateData.politicalConstituencies = {
            //         lokSabha: lokSabha !== null 
            //             ? (lokSabha ? lokSabha.split(',').map(item => item.trim()).filter(item => item) : [])
            //             : existingDistrict.politicalConstituencies.lokSabha,
            //         vidhanSabha: vidhanSabha !== null
            //             ? (vidhanSabha ? vidhanSabha.split(',').map(item => item.trim()).filter(item => item) : [])
            //             : existingDistrict.politicalConstituencies.vidhanSabha
            //     };
            // }

            const majorRivers = formData.get('majorRivers');
            if (majorRivers !== null) {
                updateData.majorRivers = majorRivers 
                    ? majorRivers.split(',').map(item => item.trim()).filter(item => item)
                    : [];
            }

            const hills = formData.get('hills');
            if (hills !== null) {
                updateData.hills = hills 
                    ? hills.split(',').map(item => item.trim()).filter(item => item)
                    : [];
            }

            const naturalSpots = formData.get('naturalSpots');
            if (naturalSpots !== null) {
                updateData.naturalSpots = naturalSpots 
                    ? naturalSpots.split(',').map(item => item.trim()).filter(item => item)
                    : [];
            }

            // Parse JSON fields
            const touristPlaces = formData.get('touristPlaces');
            if (touristPlaces) {
                try {
                    updateData.touristPlaces = JSON.parse(touristPlaces);
                } catch (error) {
                    console.error("Error parsing touristPlaces:", error);
                }
            }

            const famousPersonalities = formData.get('famousPersonalities');
            if (famousPersonalities) {
                try {
                    updateData.famousPersonalities = JSON.parse(famousPersonalities);
                } catch (error) {
                    console.error("Error parsing famousPersonalities:", error);
                }
            }

        } else {
            // Handle JSON data
            updateData = await request.json();
        }

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
            updateData.slug = updateData.slug.toLowerCase();
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

        // Clean up updateData - remove undefined or null values
        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

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

        // CASCADING DELETION - Check and delete all associated data
        let deletionSummary = [];

        // 1. Delete associated Gram Panchayats and their images
        const GramPanchayat = (await import("@/models/panchayatModel.js")).default;
        const panchayats = await GramPanchayat.find({ district: id });
        
        if (panchayats.length > 0) {
            // Delete panchayat images from Cloudinary
            for (const panchayat of panchayats) {
                if (panchayat.headerImage) {
                    try {
                        const publicId = panchayat.headerImage.split('/').pop().split('.')[0];
                        const fullPublicId = `mptourify/panchayat/${publicId}`;
                        await cloudinary.uploader.destroy(fullPublicId);
                    } catch (error) {
                        console.error("Error deleting panchayat image:", error);
                    }
                }
            }

            // Delete panchayats
            await GramPanchayat.deleteMany({ district: id });
            deletionSummary.push(`${panchayats.length} gram panchayats`);
        }

        // 2. Delete embedded tourist places images from Cloudinary
        if (district.touristPlaces && district.touristPlaces.length > 0) {
            let imageCount = 0;
            for (const place of district.touristPlaces) {
                if (place.images && place.images.length > 0) {
                    for (const image of place.images) {
                        try {
                            const publicId = image.split('/').pop().split('.')[0];
                            const fullPublicId = `mptourify/tourist-place/${publicId}`;
                            await cloudinary.uploader.destroy(fullPublicId);
                            imageCount++;
                        } catch (error) {
                            console.error("Error deleting tourist place image:", error);
                        }
                    }
                }
            }
            if (imageCount > 0) {
                deletionSummary.push(`${imageCount} tourist place images`);
            }
            deletionSummary.push(`${district.touristPlaces.length} embedded tourist places`);
        }

        // 3. Delete embedded famous personalities images from Cloudinary
        if (district.famousPersonalities && district.famousPersonalities.length > 0) {
            let imageCount = 0;
            for (const personality of district.famousPersonalities) {
                if (personality.image) {
                    try {
                        const publicId = personality.image.split('/').pop().split('.')[0];
                        const fullPublicId = `mptourify/famous-personality/${publicId}`;
                        await cloudinary.uploader.destroy(fullPublicId);
                        imageCount++;
                    } catch (error) {
                        console.error("Error deleting personality image:", error);
                    }
                }
            }
            if (imageCount > 0) {
                deletionSummary.push(`${imageCount} personality images`);
            }
            deletionSummary.push(`${district.famousPersonalities.length} embedded famous personalities`);
        }

        // 4. Delete district header image from Cloudinary
        if (district.headerImage) {
            try {
                const publicId = district.headerImage.split('/').pop().split('.')[0];
                const fullPublicId = `mptourify/district/${publicId}`;
                await cloudinary.uploader.destroy(fullPublicId);
                deletionSummary.push('district header image');
            } catch (error) {
                console.error("Error deleting district image:", error);
            }
        }

        // 5. Finally delete the district
        await District.findByIdAndDelete(id);

        return NextResponse.json(
            { 
                success: true,
                message: `District deleted successfully${deletionSummary.length > 0 ? ` along with ${deletionSummary.join(', ')}` : ''}`,
                deletedDistrict: {
                    id: district._id,
                    name: district.name,
                    slug: district.slug
                },
                cascadedDeletions: deletionSummary
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

// // GET, UPDATE, DELETE DISTRICT BY ID
// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { isAdmin } from "@/utils/getAdmin.js";
// import District from "@/models/districtModel.js";
// import mongoose from "mongoose";

// connectDB();


// // GET DISTRICT BY ID
// export async function GET(request, context) {
//     try {
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Invalid district ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // FIND DISTRICT
//         const district = await District.findById(id)
//             .populate('createdBy', 'name email');

//         if (!district) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "District not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         return NextResponse.json(
//             { 
//                 success: true,
//                 district
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get District Error:", error);
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

// // UPDATE DISTRICT BY ID
// export async function PUT(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can update districts." 
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
//                     message: "Invalid district ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF DISTRICT EXISTS
//         const existingDistrict = await District.findById(id);
//         if (!existingDistrict) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "District not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         const updateData = await request.json();

//         // IF SLUG IS BEING UPDATED, CHECK FOR DUPLICATES
//         if (updateData.slug && updateData.slug !== existingDistrict.slug) {
//             const duplicateSlug = await District.findOne({ 
//                 slug: updateData.slug.toLowerCase(),
//                 _id: { $ne: id }
//             });

//             if (duplicateSlug) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "District with this slug already exists" 
//                     },
//                     { status: 409 }
//                 );
//             }
//         }

//         // IF NAME IS BEING UPDATED, CHECK FOR DUPLICATES
//         if (updateData.name && updateData.name !== existingDistrict.name) {
//             const duplicateName = await District.findOne({ 
//                 name: updateData.name,
//                 _id: { $ne: id }
//             });

//             if (duplicateName) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "District with this name already exists" 
//                     },
//                     { status: 409 }
//                 );
//             }
//         }

//         // UPDATE DISTRICT
//         const updatedDistrict = await District.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         ).populate('createdBy', 'name email');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "District updated successfully",
//                 district: updatedDistrict
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Update District Error:", error);
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

// // DELETE DISTRICT BY ID
// export async function DELETE(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Unauthorized. Only admins can delete districts." 
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
//                     message: "Invalid district ID" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF DISTRICT EXISTS
//         const district = await District.findById(id);
//         if (!district) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "District not found" 
//                 },
//                 { status: 404 }
//             );
//         }

//         // CHECK IF DISTRICT HAS PANCHAYATS
//         const GramPanchayat = (await import("@/models/panchayatModel.js")).default;
//         const panchayatCount = await GramPanchayat.countDocuments({ district: id });

//         if (panchayatCount > 0) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: `Cannot delete district. It has ${panchayatCount} gram panchayats associated with it.` 
//                 },
//                 { status: 400 }
//             );
//         }

//         // DELETE DISTRICT
//         await District.findByIdAndDelete(id);

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "District deleted successfully",
//                 deletedDistrict: {
//                     id: district._id,
//                     name: district.name,
//                     slug: district.slug
//                 }
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Delete District Error:", error);
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