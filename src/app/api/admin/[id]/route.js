import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { isAdmin } from "@/utils/getAdmin.js";
import Admin from "@/models/adminModel.js";
import mongoose from "mongoose";
import cloudinary from "@/config/cloudinary.js";

connectDB();
export async function GET(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Only admins can view admin details."
                },
                { status: 403 }
            );
        }

        // AWAIT BOTH context AND params
        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid admin ID"
                },
                { status: 400 }
            );
        }

        // FIND ADMIN
        const admin = await Admin.findById(id)
            .select('-password')
            .populate('assignedDistricts', 'name slug');

        if (!admin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin not found"
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                admin
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Admin Error:", error);
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

export async function PUT(request, context) {
    try {
        console.log('=== ADMIN PUT REQUEST STARTED ===');
        
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Only admins can update admin details."
                },
                { status: 403 }
            );
        }

        // AWAIT BOTH context AND params
        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid admin ID"
                },
                { status: 400 }
            );
        }

        // CHECK IF ADMIN EXISTS
        const existingAdmin = await Admin.findById(id);
        if (!existingAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin not found"
                },
                { status: 404 }
            );
        }

        const contentType = request.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        let updateData = {};
        let profileImageUrl;
        let shouldDeleteImage = false;

        // HANDLE FORM DATA (FILE UPLOAD)
        if (contentType && contentType.includes('multipart/form-data')) {
            console.log('Processing FormData for admin update...');
            const formData = await request.formData();
            
            const file = formData.get('profileImage');
            const fileUrl = formData.get('profileImageUrl');
            const uploadMethod = formData.get('uploadMethod') || 'url';
            const deleteImage = formData.get('deleteImage');
            
            console.log('Upload Method:', uploadMethod);
            console.log('Delete Image:', deleteImage);

            // Handle image deletion
            if (deleteImage === 'true') {
                shouldDeleteImage = true;
                profileImageUrl = null;
                console.log('Image deletion requested');
            }
            // Handle file upload
            else if (uploadMethod === 'file' && file) {
                console.log('Uploading new profile image to Cloudinary...');
                
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (file.size > maxSize) {
                    return NextResponse.json(
                        { success: false, message: "File size exceeds 10MB limit" },
                        { status: 400 }
                    );
                }

                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    return NextResponse.json(
                        { success: false, message: "Please select a valid image file (JPEG, PNG, WebP)" },
                        { status: 400 }
                    );
                }

                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Delete old image from Cloudinary if exists
                if (existingAdmin.profileImage && existingAdmin.profileImage.includes('cloudinary')) {
                    try {
                        let publicId;
                        const url = existingAdmin.profileImage;
                        
                        console.log('Admin Profile Image URL:', url);

                        if (url.includes('cloudinary.com')) {
                            const parts = url.split('/');
                            const uploadIndex = parts.findIndex(part => part === 'upload');
                            
                            if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
                                const pathAfterUpload = parts.slice(uploadIndex + 1);
                                
                                if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
                                    pathAfterUpload.shift();
                                }
                                
                                publicId = pathAfterUpload.join('/');
                                publicId = publicId.replace(/\.[^/.]+$/, "");
                                
                                console.log('Extracted publicId for admin:', publicId);
                            }
                        }

                        if (!publicId) {
                            const filename = url.split('/').pop();
                            publicId = filename.split('.')[0];
                            console.log('Fallback publicId for admin:', publicId);
                        }

                        if (publicId) {
                            console.log(`Deleting old admin profile image from Cloudinary: ${publicId}`);
                            
                            const result = await cloudinary.uploader.destroy(publicId, {
                                resource_type: 'image',
                                invalidate: true
                            });

                            console.log('Cloudinary deletion result for admin:', result);

                            if (result.result === 'ok') {
                                console.log(`✅ Successfully deleted admin profile image: ${publicId}`);
                            } else if (result.result === 'not found') {
                                console.warn(`❌ Admin profile image not found in Cloudinary: ${publicId}`);
                            } else {
                                console.warn(`⚠️ Cloudinary response for admin: ${result.result}`);
                            }
                        }
                    } catch (cloudError) {
                        console.error('Error deleting old profile image:', cloudError);
                    }
                }

                // Upload new image
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'mptourify/users',
                            resource_type: 'image',
                            transformation: [
                                { width: 500, height: 500, crop: 'limit' },
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

                profileImageUrl = uploadResult.secure_url;
                console.log('New profile image uploaded:', profileImageUrl);
            }
            // Handle URL upload
            else if (uploadMethod === 'url' && fileUrl) {
                // Delete old image from Cloudinary if exists and is different
                if (existingAdmin.profileImage && 
                    existingAdmin.profileImage.includes('cloudinary') && 
                    existingAdmin.profileImage !== fileUrl) {
                    try {
                        let publicId;
                        const url = existingAdmin.profileImage;
                        
                        console.log('Admin Profile Image URL:', url);

                        if (url.includes('cloudinary.com')) {
                            const parts = url.split('/');
                            const uploadIndex = parts.findIndex(part => part === 'upload');
                            
                            if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
                                const pathAfterUpload = parts.slice(uploadIndex + 1);
                                
                                if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
                                    pathAfterUpload.shift();
                                }
                                
                                publicId = pathAfterUpload.join('/');
                                publicId = publicId.replace(/\.[^/.]+$/, "");
                                
                                console.log('Extracted publicId for admin:', publicId);
                            }
                        }

                        if (!publicId) {
                            const filename = url.split('/').pop();
                            publicId = filename.split('.')[0];
                            console.log('Fallback publicId for admin:', publicId);
                        }

                        if (publicId) {
                            console.log(`Deleting old admin profile image from Cloudinary: ${publicId}`);
                            
                            const result = await cloudinary.uploader.destroy(publicId, {
                                resource_type: 'image',
                                invalidate: true
                            });

                            console.log('Cloudinary deletion result for admin:', result);
                        }
                    } catch (cloudError) {
                        console.error('Error deleting old profile image:', cloudError);
                    }
                }
                
                profileImageUrl = fileUrl;
                console.log('Using URL for profile image:', profileImageUrl);
            }

            // Parse other form fields
            if (formData.get('name')) updateData.name = formData.get('name');
            if (formData.get('phone')) updateData.phone = formData.get('phone');
            if (formData.get('role')) updateData.role = formData.get('role');
            if (formData.get('employeeId') !== null) updateData.employeeId = formData.get('employeeId');
            if (formData.get('designation') !== null) updateData.designation = formData.get('designation');
            if (formData.get('status')) updateData.status = formData.get('status');
            
            const assignedDistrictsStr = formData.get('assignedDistricts');
            if (assignedDistrictsStr) {
                try {
                    updateData.assignedDistricts = JSON.parse(assignedDistrictsStr);
                } catch (e) {
                    console.error('Error parsing assignedDistricts:', e);
                }
            }

            // Handle profile image
            if (shouldDeleteImage) {
                // Delete from Cloudinary if exists
                if (existingAdmin.profileImage && existingAdmin.profileImage.includes('cloudinary')) {
                    try {
                        let publicId;
                        const url = existingAdmin.profileImage;
                        
                        console.log('Admin Profile Image URL:', url);

                        if (url.includes('cloudinary.com')) {
                            const parts = url.split('/');
                            const uploadIndex = parts.findIndex(part => part === 'upload');
                            
                            if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
                                const pathAfterUpload = parts.slice(uploadIndex + 1);
                                
                                if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
                                    pathAfterUpload.shift();
                                }
                                
                                publicId = pathAfterUpload.join('/');
                                publicId = publicId.replace(/\.[^/.]+$/, "");
                                
                                console.log('Extracted publicId for admin:', publicId);
                            }
                        }

                        if (!publicId) {
                            const filename = url.split('/').pop();
                            publicId = filename.split('.')[0];
                            console.log('Fallback publicId for admin:', publicId);
                        }

                        if (publicId) {
                            console.log(`Deleting admin profile image from Cloudinary: ${publicId}`);
                            
                            const result = await cloudinary.uploader.destroy(publicId, {
                                resource_type: 'image',
                                invalidate: true
                            });

                            console.log('Cloudinary deletion result for admin:', result);

                            if (result.result === 'ok') {
                                console.log(`✅ Successfully deleted admin profile image: ${publicId}`);
                            } else if (result.result === 'not found') {
                                console.warn(`❌ Admin profile image not found in Cloudinary: ${publicId}`);
                            } else {
                                console.warn(`⚠️ Cloudinary response for admin: ${result.result}`);
                            }
                        }
                    } catch (cloudError) {
                        console.error('Error deleting profile image:', cloudError);
                    }
                }
                updateData.profileImage = null;
            } else if (profileImageUrl) {
                updateData.profileImage = profileImageUrl;
            }
        } 
        // HANDLE JSON DATA
        else {
            console.log('Processing JSON data for admin update...');
            const jsonData = await request.json();
            
            const { name, phone, role, assignedDistricts, employeeId, designation, status, profileImage, uploadMethod } = jsonData;

            if (name) updateData.name = name;
            if (phone) updateData.phone = phone;
            if (role) updateData.role = role;
            if (assignedDistricts) updateData.assignedDistricts = assignedDistricts;
            if (employeeId !== undefined) updateData.employeeId = employeeId;
            if (designation !== undefined) updateData.designation = designation;
            if (status) updateData.status = status;
            
            // Handle profile image URL from JSON
            if (uploadMethod === 'url' && profileImage) {
                // Delete old image if it's different
                if (existingAdmin.profileImage && 
                    existingAdmin.profileImage.includes('cloudinary') && 
                    existingAdmin.profileImage !== profileImage) {
                    try {
                        let publicId;
                        const url = existingAdmin.profileImage;
                        
                        console.log('Admin Profile Image URL:', url);

                        if (url.includes('cloudinary.com')) {
                            const parts = url.split('/');
                            const uploadIndex = parts.findIndex(part => part === 'upload');
                            
                            if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
                                const pathAfterUpload = parts.slice(uploadIndex + 1);
                                
                                if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
                                    pathAfterUpload.shift();
                                }
                                
                                publicId = pathAfterUpload.join('/');
                                publicId = publicId.replace(/\.[^/.]+$/, "");
                                
                                console.log('Extracted publicId for admin:', publicId);
                            }
                        }

                        if (!publicId) {
                            const filename = url.split('/').pop();
                            publicId = filename.split('.')[0];
                            console.log('Fallback publicId for admin:', publicId);
                        }

                        if (publicId) {
                            await cloudinary.uploader.destroy(publicId, {
                                resource_type: 'image',
                                invalidate: true
                            });
                        }
                    } catch (cloudError) {
                        console.error('Error deleting old profile image:', cloudError);
                    }
                }
                updateData.profileImage = profileImage;
            }
        }

        console.log('Update data:', JSON.stringify(updateData, null, 2));

        // VALIDATE ROLE IF PROVIDED
        if (updateData.role && !['admin', 'rtc'].includes(updateData.role)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid role. Must be 'admin' or 'rtc'"
                },
                { status: 400 }
            );
        }

        // VALIDATE STATUS IF PROVIDED
        if (updateData.status && !['active', 'inactive'].includes(updateData.status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid status. Must be 'active' or 'inactive'"
                },
                { status: 400 }
            );
        }

        // CHECK IF RTC HAS ASSIGNED DISTRICTS
        if (updateData.role === 'rtc' && updateData.assignedDistricts && updateData.assignedDistricts.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "RTC must have at least one assigned district"
                },
                { status: 400 }
            );
        }

        // VALIDATE ASSIGNED DISTRICTS IF PROVIDED
        if (updateData.assignedDistricts) {
            const validDistricts = updateData.assignedDistricts.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!validDistricts) {
                return NextResponse.json(
                    { success: false, message: "Invalid district IDs in assignedDistricts" },
                    { status: 400 }
                );
            }
        }

        console.log('Updating admin in database...');

        // UPDATE ADMIN
        const updatedAdmin = await Admin.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password').populate('assignedDistricts', 'name slug');

        console.log('Admin updated successfully:', updatedAdmin._id);
        console.log('=== ADMIN PUT REQUEST COMPLETED ===');

        return NextResponse.json(
            {
                success: true,
                message: "Admin updated successfully",
                admin: updatedAdmin
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Admin Error:", error);
        console.error("Error Stack:", error.stack);
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
export async function DELETE(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();

        if (!hasAdminRole) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized. Only admins can delete accounts."
                },
                { status: 403 }
            );
        }

        // AWAIT BOTH context AND params
        const { params } = await context;
        const { id } = await params;

        // VALIDATE MONGODB ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid admin ID"
                },
                { status: 400 }
            );
        }

        // PREVENT SELF-DELETION
        if (currentAdmin._id.toString() === id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You cannot delete your own account"
                },
                { status: 400 }
            );
        }

        // CHECK IF ADMIN EXISTS
        const adminToDelete = await Admin.findById(id);
        if (!adminToDelete) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin not found"
                },
                { status: 404 }
            );
        }

        // DELETE PROFILE IMAGE FROM CLOUDINARY IF EXISTS
        if (adminToDelete.profileImage && adminToDelete.profileImage.includes('cloudinary')) {
            try {
                let publicId;
                const url = adminToDelete.profileImage;
                
                console.log('Admin Profile Image URL:', url);

                if (url.includes('cloudinary.com')) {
                    const parts = url.split('/');
                    const uploadIndex = parts.findIndex(part => part === 'upload');
                    
                    if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
                        const pathAfterUpload = parts.slice(uploadIndex + 1);
                        
                        if (pathAfterUpload[0] && pathAfterUpload[0].startsWith('v')) {
                            pathAfterUpload.shift();
                        }
                        
                        publicId = pathAfterUpload.join('/');
                        publicId = publicId.replace(/\.[^/.]+$/, "");
                        
                        console.log('Extracted publicId for admin:', publicId);
                    }
                }

                if (!publicId) {
                    const filename = url.split('/').pop();
                    publicId = filename.split('.')[0];
                    console.log('Fallback publicId for admin:', publicId);
                }

                if (publicId) {
                    console.log(`Deleting admin profile image from Cloudinary: ${publicId}`);
                    
                    const result = await cloudinary.uploader.destroy(publicId, {
                        resource_type: 'image',
                        invalidate: true
                    });

                    console.log('Cloudinary deletion result for admin:', result);

                    if (result.result === 'ok') {
                        console.log(`✅ Successfully deleted admin profile image: ${publicId}`);
                    } else if (result.result === 'not found') {
                        console.warn(`❌ Admin profile image not found in Cloudinary: ${publicId}`);
                    } else {
                        console.warn(`⚠️ Cloudinary response for admin: ${result.result}`);
                    }
                }
            } catch (cloudError) {
                console.error("Cloudinary delete error for admin:", cloudError);
                // Continue with deletion even if Cloudinary delete fails
            }
        }

        // DELETE ADMIN
        await Admin.findByIdAndDelete(id);

        return NextResponse.json(
            {
                success: true,
                message: `${adminToDelete.role === 'admin' ? 'Admin' : 'RTC'} deleted successfully`,
                deletedAdmin: {
                    id: adminToDelete._id,
                    name: adminToDelete.name,
                    email: adminToDelete.email,
                    role: adminToDelete.role
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete Admin Error:", error);
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



// import { NextResponse } from "next/server";
// import { connectDB } from "@/dbConfig/dbConnect.js";
// import { isAdmin } from "@/utils/getAdmin.js";
// import Admin from "@/models/adminModel.js";
// import District from "@/models/districtModel";
// import mongoose from "mongoose";
// import cloudinary from "@/config/cloudinary.js";

// connectDB();

// function getCloudinaryPublicId(imageUrl) {
//     try {
//         const urlParts = imageUrl.split('/');
//         const uploadIndex = urlParts.indexOf('upload');
//         if (uploadIndex === -1) return null;
        
//         const publicIdWithExtension = urlParts.slice(uploadIndex + 1).join('/');
//         const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
        
//         return publicId;
//     } catch (error) {
//         console.error('Error extracting public_id:', error);
//         return null;
//     }
// }
// // GET ADMIN BY ID
// export async function GET(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Unauthorized. Only admins can view admin details."
//                 },
//                 { status: 403 }
//             );
//         }

//         // AWAIT BOTH context AND params
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid admin ID"
//                 },
//                 { status: 400 }
//             );
//         }

//         // FIND ADMIN
//         const admin = await Admin.findById(id)
//             .select('-password')
//             .populate('assignedDistricts', 'name slug');

//         if (!admin) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Admin not found"
//                 },
//                 { status: 404 }
//             );
//         }

//         return NextResponse.json(
//             {
//                 success: true,
//                 admin
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Get Admin Error:", error);
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

// export async function PUT(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Unauthorized. Only admins can update admin details."
//                 },
//                 { status: 403 }
//             );
//         }

//         // AWAIT BOTH context AND params
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid admin ID"
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF ADMIN EXISTS
//         const existingAdmin = await Admin.findById(id);
//         if (!existingAdmin) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Admin not found"
//                 },
//                 { status: 404 }
//             );
//         }

//         // Handle both form data and JSON
//         const contentType = request.headers.get('content-type');
//         let name, phone, role, assignedDistricts, employeeId, designation, status;
//         let newProfileImageUrl = null;
//         let imageChanged = false;

//         if (contentType && contentType.includes('multipart/form-data')) {
//             const formData = await request.formData();
            
//             // Handle profile image upload
//             const file = formData.get('profileImage');
//             const imageUrl = formData.get('profileImageUrl');
//             const uploadMethod = formData.get('uploadMethod') || 'file';
//             const deleteImage = formData.get('deleteImage') === 'true';

//             if (deleteImage && existingAdmin.profileImage) {
//                 // DELETE OLD IMAGE FROM CLOUDINARY
//                 try {
//                     const publicId = getCloudinaryPublicId(existingAdmin.profileImage);
//                     if (publicId) {
//                         const result = await cloudinary.uploader.destroy(publicId);
//                         console.log('Successfully deleted image:', publicId, result);
//                     }
//                 } catch (error) {
//                     console.error("Error deleting old image:", error);
//                 }
//                 newProfileImageUrl = null;
//                 imageChanged = true;
//             } else if (uploadMethod === 'file' && file) {
//                 // DELETE OLD IMAGE IF EXISTS BEFORE UPLOADING NEW ONE
//                 if (existingAdmin.profileImage) {
//                     try {
//                         const publicId = getCloudinaryPublicId(existingAdmin.profileImage);
//                         if (publicId) {
//                             const result = await cloudinary.uploader.destroy(publicId);
//                             console.log('Successfully deleted old image:', publicId, result);
//                         }
//                     } catch (error) {
//                         console.error("Error deleting old image:", error);
//                         // Continue with upload even if deletion fails
//                     }
//                 }

//                 // VALIDATE FILE SIZE (Max 10MB)
//                 const maxSize = 10 * 1024 * 1024;
//                 if (file.size > maxSize) {
//                     return NextResponse.json(
//                         { 
//                             success: false,
//                             message: "File size exceeds 10MB limit" 
//                         },
//                         { status: 400 }
//                     );
//                 }

//                 // VALIDATE FILE TYPE
//                 const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//                 if (!validTypes.includes(file.type)) {
//                     return NextResponse.json(
//                         { 
//                             success: false,
//                             message: "Please select a valid image file (JPEG, PNG, WebP)" 
//                         },
//                         { status: 400 }
//                     );
//                 }

//                 // UPLOAD NEW IMAGE
//                 const bytes = await file.arrayBuffer();
//                 const buffer = Buffer.from(bytes);

//                 const uploadResult = await new Promise((resolve, reject) => {
//                     const uploadStream = cloudinary.uploader.upload_stream(
//                         {
//                             folder: 'mptourify/users',
//                             resource_type: 'image',
//                             transformation: [
//                                 { width: 500, height: 500, crop: 'limit' },
//                                 { quality: 'auto:good' }
//                             ]
//                         },
//                         (error, result) => {
//                             if (error) reject(error);
//                             else resolve(result);
//                         }
//                     );
//                     uploadStream.end(buffer);
//                 });

//                 newProfileImageUrl = uploadResult.secure_url;
//                 imageChanged = true;
//                 console.log('Successfully uploaded new image:', newProfileImageUrl);
//             } else if (uploadMethod === 'url' && imageUrl) {
//                 // DELETE OLD IMAGE IF EXISTS BEFORE SETTING NEW URL
//                 if (existingAdmin.profileImage) {
//                     try {
//                         const publicId = getCloudinaryPublicId(existingAdmin.profileImage);
//                         if (publicId) {
//                             const result = await cloudinary.uploader.destroy(publicId);
//                             console.log('Successfully deleted old image:', publicId, result);
//                         }
//                     } catch (error) {
//                         console.error("Error deleting old image:", error);
//                     }
//                 }
//                 newProfileImageUrl = imageUrl;
//                 imageChanged = true;
//             }

//             // Parse other form data
//             name = formData.get('name');
//             phone = formData.get('phone');
//             role = formData.get('role');
//             assignedDistricts = JSON.parse(formData.get('assignedDistricts') || '[]');
//             employeeId = formData.get('employeeId');
//             designation = formData.get('designation');
//             status = formData.get('status');
//         } else {
//             // Handle JSON data
//             const jsonData = await request.json();
//             ({ name, phone, role, assignedDistricts, employeeId, designation, status } = jsonData);
//         }

//         // VALIDATE ROLE IF PROVIDED
//         if (role && !['admin', 'rtc'].includes(role)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid role. Must be 'admin' or 'rtc'"
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE STATUS IF PROVIDED
//         if (status && !['active', 'inactive'].includes(status)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid status. Must be 'active' or 'inactive'"
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF RTC HAS ASSIGNED DISTRICTS
//         if (role === 'rtc' && assignedDistricts && assignedDistricts.length === 0) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "RTC must have at least one assigned district"
//                 },
//                 { status: 400 }
//             );
//         }

//         // UPDATE FIELDS
//         const updateData = {};
//         if (name) updateData.name = name;
//         if (phone) updateData.phone = phone;
//         if (role) updateData.role = role;
//         if (assignedDistricts) updateData.assignedDistricts = assignedDistricts;
//         if (employeeId !== undefined) updateData.employeeId = employeeId;
//         if (designation !== undefined) updateData.designation = designation;
//         if (status) updateData.status = status;
//         if (imageChanged) updateData.profileImage = newProfileImageUrl;

//         const updatedAdmin = await Admin.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         ).select('-password').populate('assignedDistricts', 'name slug');

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "Admin updated successfully",
//                 admin: updatedAdmin
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Update Admin Error:", error);
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

// // DELETE ADMIN BY ID
// export async function DELETE(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Unauthorized. Only admins can delete accounts."
//                 },
//                 { status: 403 }
//             );
//         }

//         // AWAIT BOTH context AND params
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid admin ID"
//                 },
//                 { status: 400 }
//             );
//         }

//         // PREVENT SELF-DELETION
//         if (currentAdmin._id.toString() === id) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "You cannot delete your own account"
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF ADMIN EXISTS
//         const adminToDelete = await Admin.findById(id);
//         if (!adminToDelete) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Admin not found"
//                 },
//                 { status: 404 }
//             );
//         }

//         // DELETE PROFILE IMAGE FROM CLOUDINARY IF EXISTS
//         if (adminToDelete.profileImage) {
//             try {
//                 const publicId = getCloudinaryPublicId(adminToDelete.profileImage);
//                 if (publicId) {
//                     await cloudinary.uploader.destroy(publicId);
//                     console.log('Successfully deleted image from Cloudinary:', publicId);
//                 }
//             } catch (error) {
//                 console.error("Error deleting profile image from Cloudinary:", error);
//                 // Continue with admin deletion even if image deletion fails
//             }
//         }

//         // DELETE ADMIN
//         await Admin.findByIdAndDelete(id);

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: `${adminToDelete.role === 'admin' ? 'Admin' : 'RTC'} deleted successfully`,
//                 deletedAdmin: {
//                     id: adminToDelete._id,
//                     name: adminToDelete.name,
//                     email: adminToDelete.email,
//                     role: adminToDelete.role
//                 }
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Delete Admin Error:", error);
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


// // UPDATE ADMIN BY ID
// export async function PUT(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Unauthorized. Only admins can update admin details."
//                 },
//                 { status: 403 }
//             );
//         }

//         // AWAIT BOTH context AND params
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid admin ID"
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF ADMIN EXISTS
//         const existingAdmin = await Admin.findById(id);
//         if (!existingAdmin) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Admin not found"
//                 },
//                 { status: 404 }
//             );
//         }

//         // Handle both form data and JSON
//         const contentType = request.headers.get('content-type');
//         let name, phone, role, assignedDistricts, employeeId, designation, status;
//         let newProfileImageUrl = null;

//         if (contentType && contentType.includes('multipart/form-data')) {
//             const formData = await request.formData();
            
//             // Handle profile image upload
//             const file = formData.get('profileImage');
//             const imageUrl = formData.get('profileImageUrl');
//             const uploadMethod = formData.get('uploadMethod') || 'file';
//             const deleteImage = formData.get('deleteImage') === 'true';

//             if (deleteImage && existingAdmin.profileImage) {
//                 // DELETE OLD IMAGE FROM CLOUDINARY
//                 try {
//                     const publicId = existingAdmin.profileImage.split('/').slice(-2).join('/').split('.')[0];
//                     await cloudinary.uploader.destroy(`mptourify/users/${publicId.split('/')[1]}`);
//                 } catch (error) {
//                     console.error("Error deleting old image:", error);
//                 }
//                 newProfileImageUrl = null;
//             } else if (uploadMethod === 'file' && file) {
//                 // DELETE OLD IMAGE IF EXISTS
//                 if (existingAdmin.profileImage) {
//                     try {
//                         const publicId = existingAdmin.profileImage.split('/').slice(-2).join('/').split('.')[0];
//                         await cloudinary.uploader.destroy(`mptourify/users/${publicId.split('/')[1]}`);
//                     } catch (error) {
//                         console.error("Error deleting old image:", error);
//                     }
//                 }

//                 // VALIDATE FILE SIZE (Max 10MB)
//                 const maxSize = 10 * 1024 * 1024;
//                 if (file.size > maxSize) {
//                     return NextResponse.json(
//                         { 
//                             success: false,
//                             message: "File size exceeds 10MB limit" 
//                         },
//                         { status: 400 }
//                     );
//                 }

//                 // VALIDATE FILE TYPE
//                 const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//                 if (!validTypes.includes(file.type)) {
//                     return NextResponse.json(
//                         { 
//                             success: false,
//                             message: "Please select a valid image file (JPEG, PNG, WebP)" 
//                         },
//                         { status: 400 }
//                     );
//                 }

//                 // UPLOAD NEW IMAGE
//                 const bytes = await file.arrayBuffer();
//                 const buffer = Buffer.from(bytes);

//                 const uploadResult = await new Promise((resolve, reject) => {
//                     const uploadStream = cloudinary.uploader.upload_stream(
//                         {
//                             folder: 'mptourify/users',
//                             resource_type: 'image',
//                             transformation: [
//                                 { width: 500, height: 500, crop: 'limit' },
//                                 { quality: 'auto:good' }
//                             ]
//                         },
//                         (error, result) => {
//                             if (error) reject(error);
//                             else resolve(result);
//                         }
//                     );
//                     uploadStream.end(buffer);
//                 });

//                 newProfileImageUrl = uploadResult.secure_url;
//             } else if (uploadMethod === 'url' && imageUrl) {
//                 // DELETE OLD IMAGE IF EXISTS
//                 if (existingAdmin.profileImage) {
//                     try {
//                         const publicId = existingAdmin.profileImage.split('/').slice(-2).join('/').split('.')[0];
//                         await cloudinary.uploader.destroy(`mptourify/users/${publicId.split('/')[1]}`);
//                     } catch (error) {
//                         console.error("Error deleting old image:", error);
//                     }
//                 }
//                 newProfileImageUrl = imageUrl;
//             }

//             // Parse other form data
//             name = formData.get('name');
//             phone = formData.get('phone');
//             role = formData.get('role');
//             assignedDistricts = JSON.parse(formData.get('assignedDistricts') || '[]');
//             employeeId = formData.get('employeeId');
//             designation = formData.get('designation');
//             status = formData.get('status');
//         } else {
//             // Handle JSON data
//             const jsonData = await request.json();
//             ({ name, phone, role, assignedDistricts, employeeId, designation, status } = jsonData);
//         }

//         // VALIDATE ROLE IF PROVIDED
//         if (role && !['admin', 'rtc'].includes(role)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid role. Must be 'admin' or 'rtc'"
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE STATUS IF PROVIDED
//         if (status && !['active', 'inactive'].includes(status)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid status. Must be 'active' or 'inactive'"
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF RTC HAS ASSIGNED DISTRICTS
//         if (role === 'rtc' && assignedDistricts && assignedDistricts.length === 0) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "RTC must have at least one assigned district"
//                 },
//                 { status: 400 }
//             );
//         }

//         // UPDATE FIELDS
//         const updateData = {};
//         if (name) updateData.name = name;
//         if (phone) updateData.phone = phone;
//         if (role) updateData.role = role;
//         if (assignedDistricts) updateData.assignedDistricts = assignedDistricts;
//         if (employeeId !== undefined) updateData.employeeId = employeeId;
//         if (designation !== undefined) updateData.designation = designation;
//         if (status) updateData.status = status;
//         if (newProfileImageUrl !== null) updateData.profileImage = newProfileImageUrl;

//         const updatedAdmin = await Admin.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         ).select('-password').populate('assignedDistricts', 'name slug');

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "Admin updated successfully",
//                 admin: updatedAdmin
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Update Admin Error:", error);
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



// DELETE ADMIN BY ID
// export async function DELETE(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Unauthorized. Only admins can delete accounts."
//                 },
//                 { status: 403 }
//             );
//         }

//         // AWAIT BOTH context AND params
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid admin ID"
//                 },
//                 { status: 400 }
//             );
//         }

//         // PREVENT SELF-DELETION
//         if (currentAdmin._id.toString() === id) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "You cannot delete your own account"
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF ADMIN EXISTS
//         const adminToDelete = await Admin.findById(id);
//         if (!adminToDelete) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Admin not found"
//                 },
//                 { status: 404 }
//             );
//         }

//         // DELETE PROFILE IMAGE FROM CLOUDINARY IF EXISTS
//         if (adminToDelete.profileImage) {
//             try {
//                 const publicId = adminToDelete.profileImage.split('/').slice(-2).join('/').split('.')[0];
//                 await cloudinary.uploader.destroy(`mptourify/users/${publicId.split('/')[1]}`);
//             } catch (error) {
//                 console.error("Error deleting profile image:", error);
//             }
//         }

//         // DELETE ADMIN
//         await Admin.findByIdAndDelete(id);

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: `${adminToDelete.role === 'admin' ? 'Admin' : 'RTC'} deleted successfully`,
//                 deletedAdmin: {
//                     id: adminToDelete._id,
//                     name: adminToDelete.name,
//                     email: adminToDelete.email,
//                     role: adminToDelete.role
//                 }
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Delete Admin Error:", error);
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

// // UPDATE ADMIN BY ID
// export async function PUT(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Unauthorized. Only admins can update admin details."
//                 },
//                 { status: 403 }
//             );
//         }

//         // AWAIT BOTH context AND params
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid admin ID"
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF ADMIN EXISTS
//         const existingAdmin = await Admin.findById(id);
//         if (!existingAdmin) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Admin not found"
//                 },
//                 { status: 404 }
//             );
//         }

//         const { name, phone, role, assignedDistricts, employeeId, designation, status } = await request.json();

//         // VALIDATE ROLE IF PROVIDED
//         if (role && !['admin', 'rtc'].includes(role)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid role. Must be 'admin' or 'rtc'"
//                 },
//                 { status: 400 }
//             );
//         }

//         // VALIDATE STATUS IF PROVIDED
//         if (status && !['active', 'inactive'].includes(status)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid status. Must be 'active' or 'inactive'"
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF RTC HAS ASSIGNED DISTRICTS
//         if (role === 'rtc' && assignedDistricts && assignedDistricts.length === 0) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "RTC must have at least one assigned district"
//                 },
//                 { status: 400 }
//             );
//         }

//         // UPDATE FIELDS
//         const updateData = {};
//         if (name) updateData.name = name;
//         if (phone) updateData.phone = phone;
//         if (role) updateData.role = role;
//         if (assignedDistricts) updateData.assignedDistricts = assignedDistricts;
//         if (employeeId !== undefined) updateData.employeeId = employeeId;
//         if (designation !== undefined) updateData.designation = designation;
//         if (status) updateData.status = status;

//         const updatedAdmin = await Admin.findByIdAndUpdate(
//             id,
//             updateData,
//             { new: true, runValidators: true }
//         ).select('-password').populate('assignedDistricts', 'name slug');

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: "Admin updated successfully",
//                 admin: updatedAdmin
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Update Admin Error:", error);
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

// // DELETE ADMIN BY ID
// export async function DELETE(request, context) {
//     try {
//         // CHECK IF CURRENT USER IS ADMIN
//         const { isAdmin: hasAdminRole, admin: currentAdmin } = await isAdmin();

//         if (!hasAdminRole) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Unauthorized. Only admins can delete accounts."
//                 },
//                 { status: 403 }
//             );
//         }

//         // AWAIT BOTH context AND params
//         const { params } = await context;
//         const { id } = await params;

//         // VALIDATE MONGODB ID
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Invalid admin ID"
//                 },
//                 { status: 400 }
//             );
//         }

//         // PREVENT SELF-DELETION
//         if (currentAdmin._id.toString() === id) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "You cannot delete your own account"
//                 },
//                 { status: 400 }
//             );
//         }

//         // CHECK IF ADMIN EXISTS
//         const adminToDelete = await Admin.findById(id);
//         if (!adminToDelete) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Admin not found"
//                 },
//                 { status: 404 }
//             );
//         }

//         // DELETE ADMIN
//         await Admin.findByIdAndDelete(id);

//         return NextResponse.json(
//             {
//                 success: true,
//                 message: `${adminToDelete.role === 'admin' ? 'Admin' : 'RTC'} deleted successfully`,
//                 deletedAdmin: {
//                     id: adminToDelete._id,
//                     name: adminToDelete.name,
//                     email: adminToDelete.email,
//                     role: adminToDelete.role
//                 }
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Delete Admin Error:", error);
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