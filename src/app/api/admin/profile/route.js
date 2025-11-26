import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import Admin from "@/models/adminModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "@/config/cloudinary.js";
connectDB();

// GET PROFILE
export async function GET(request) {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Not authenticated" 
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { 
                success: true,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    phone: admin.phone,
                    profileImage: admin.profileImage, 
                    employeeId: admin.employeeId,
                    designation: admin.designation,
                    assignedDistricts: admin.assignedDistricts,
                    status: admin.status,
                    lastLogin: admin.lastLogin,
                    createdAt: admin.createdAt
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Profile Error:", error);
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


// UPDATE OWN PROFILE
export async function PUT(request) {
    try {
        const currentAdmin = await getAdmin();

        if (!currentAdmin) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Not authenticated" 
                },
                { status: 401 }
            );
        }

        const contentType = request.headers.get('content-type');
        
        let updateData = {};
        let newProfileImageUrl = null;

        if (contentType && contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            // Handle profile image upload
            const file = formData.get('profileImage');
            const imageUrl = formData.get('profileImageUrl');
            const uploadMethod = formData.get('uploadMethod') || 'file';
            const deleteImage = formData.get('deleteImage') === 'true';

            if (deleteImage && currentAdmin.profileImage) {
                // DELETE OLD IMAGE FROM CLOUDINARY
                try {
                    const publicId = currentAdmin.profileImage.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(`mptourify/users/${publicId.split('/')[1]}`);
                } catch (error) {
                    console.error("Error deleting old image:", error);
                }
                newProfileImageUrl = null;
            } else if (uploadMethod === 'file' && file) {
                // DELETE OLD IMAGE IF EXISTS
                if (currentAdmin.profileImage) {
                    try {
                        const publicId = currentAdmin.profileImage.split('/').slice(-2).join('/').split('.')[0];
                        await cloudinary.uploader.destroy(`mptourify/users/${publicId.split('/')[1]}`);
                    } catch (error) {
                        console.error("Error deleting old image:", error);
                    }
                }

                // VALIDATE FILE SIZE
                const maxSize = 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    return NextResponse.json(
                        { 
                            success: false,
                            message: "File size exceeds 10MB limit" 
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

                // UPLOAD NEW IMAGE
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

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

                newProfileImageUrl = uploadResult.secure_url;
            } else if (uploadMethod === 'url' && imageUrl) {
                // DELETE OLD IMAGE IF EXISTS
                if (currentAdmin.profileImage) {
                    try {
                        const publicId = currentAdmin.profileImage.split('/').slice(-2).join('/').split('.')[0];
                        await cloudinary.uploader.destroy(`mptourify/users/${publicId.split('/')[1]}`);
                    } catch (error) {
                        console.error("Error deleting old image:", error);
                    }
                }
                newProfileImageUrl = imageUrl;
            }

            // Parse other form data
            updateData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                employeeId: formData.get('employeeId'),
                designation: formData.get('designation'),
                currentPassword: formData.get('currentPassword'),
                newPassword: formData.get('newPassword')
            };
        } else {
            updateData = await request.json();
        }

        const { name, phone, employeeId, designation, currentPassword, newPassword } = updateData;

        // VALIDATE AT LEAST ONE FIELD TO UPDATE
        if (!name && !phone && !employeeId && !designation && !newPassword && newProfileImageUrl === null && !updateData.deleteImage) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide at least one field to update" 
                },
                { status: 400 }
            );
        }

        // IF PASSWORD CHANGE REQUESTED
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Current password is required to change password" 
                    },
                    { status: 400 }
                );
            }

            const admin = await Admin.findById(currentAdmin._id);
            const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
            
            if (!isPasswordValid) {
                return NextResponse.json(
                    { 
                        success: false,
                        message: "Current password is incorrect" 
                    },
                    { status: 401 }
                );
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            admin.password = hashedPassword;
            await admin.save();
        }

        // UPDATE OTHER FIELDS
        const fieldsToUpdate = {};
        if (name) fieldsToUpdate.name = name;
        if (phone) fieldsToUpdate.phone = phone;
        if (employeeId) fieldsToUpdate.employeeId = employeeId;
        if (designation) fieldsToUpdate.designation = designation;
        if (newProfileImageUrl !== null) fieldsToUpdate.profileImage = newProfileImageUrl;

        const updatedAdmin = await Admin.findByIdAndUpdate(
            currentAdmin._id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        ).select('-password');

        return NextResponse.json(
            { 
                success: true,
                message: "Profile updated successfully",
                admin: {
                    id: updatedAdmin._id,
                    name: updatedAdmin.name,
                    email: updatedAdmin.email,
                    role: updatedAdmin.role,
                    phone: updatedAdmin.phone,
                    profileImage: updatedAdmin.profileImage,
                    employeeId: updatedAdmin.employeeId,
                    designation: updatedAdmin.designation,
                    assignedDistricts: updatedAdmin.assignedDistricts
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Profile Error:", error);
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
// export async function PUT(request) {
//     try {
//         const currentAdmin = await getAdmin();

//         if (!currentAdmin) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Not authenticated" 
//                 },
//                 { status: 401 }
//             );
//         }

//         const { name, phone, employeeId, designation, currentPassword, newPassword } = await request.json();

//         // VALIDATE AT LEAST ONE FIELD TO UPDATE
//         if (!name && !phone && !employeeId && !designation && !newPassword) {
//             return NextResponse.json(
//                 { 
//                     success: false,
//                     message: "Please provide at least one field to update" 
//                 },
//                 { status: 400 }
//             );
//         }

//         // IF PASSWORD CHANGE REQUESTED
//         if (newPassword) {
//             if (!currentPassword) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Current password is required to change password" 
//                     },
//                     { status: 400 }
//                 );
//             }

//             // VERIFY CURRENT PASSWORD
//             const admin = await Admin.findById(currentAdmin._id);
//             const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
            
//             if (!isPasswordValid) {
//                 return NextResponse.json(
//                     { 
//                         success: false,
//                         message: "Current password is incorrect" 
//                     },
//                     { status: 401 }
//                 );
//             }

//             // HASH NEW PASSWORD
//             const salt = await bcrypt.genSalt(10);
//             const hashedPassword = await bcrypt.hash(newPassword, salt);
//             admin.password = hashedPassword;
//             await admin.save();
//         }

//         // UPDATE OTHER FIELDS
//         const updateData = {};
//         if (name) updateData.name = name;
//         if (phone) updateData.phone = phone;
//         if (employeeId) updateData.employeeId = employeeId;
//         if (designation) updateData.designation = designation;

//         const updatedAdmin = await Admin.findByIdAndUpdate(
//             currentAdmin._id,
//             updateData,
//             { new: true, runValidators: true }
//         ).select('-password');

//         return NextResponse.json(
//             { 
//                 success: true,
//                 message: "Profile updated successfully",
//                 admin: {
//                     id: updatedAdmin._id,
//                     name: updatedAdmin.name,
//                     email: updatedAdmin.email,
//                     role: updatedAdmin.role,
//                     phone: updatedAdmin.phone,
//                     employeeId: updatedAdmin.employeeId,
//                     designation: updatedAdmin.designation,
//                     assignedDistricts: updatedAdmin.assignedDistricts
//                 }
//             },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Update Profile Error:", error);
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