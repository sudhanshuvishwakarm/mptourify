// For admin dashboard stats api
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { checkRole } from "@/utils/getAdmin.js";
import Admin from "@/models/adminModel.js";
import District from "@/models/districtModel.js";
import GramPanchayat from "@/models/panchayatModel.js";
import Media from "@/models/mediaModel.js";
import News from "@/models/newsModel.js";
import Contact from "@/models/contactModel.js";

connectDB();

export async function GET(request) {
    try {
        // CHECK IF USER HAS ACCESS (ADMIN OR RTC)
        const { hasAccess, admin: currentAdmin } = await checkRole(['admin', 'rtc']);

        if (!hasAccess) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins and RTCs can view statistics." 
                },
                { status: 403 }
            );
        }

        // OVERALL STATISTICS
        const totalDistricts = await District.countDocuments({ status: 'active' });
        const totalPanchayats = await GramPanchayat.countDocuments();
        const verifiedPanchayats = await GramPanchayat.countDocuments({ status: 'verified' });
        const pendingPanchayats = await GramPanchayat.countDocuments({ status: 'pending' });

        // MEDIA STATISTICS
        const totalMedia = await Media.countDocuments();
        const approvedMedia = await Media.countDocuments({ status: 'approved' });
        const pendingMedia = await Media.countDocuments({ status: 'pending' });
        const totalImages = await Media.countDocuments({ fileType: 'image', status: 'approved' });
        const totalVideos = await Media.countDocuments({ fileType: 'video', status: 'approved' });

        // NEWS STATISTICS
        const totalNews = await News.countDocuments();
        const publishedNews = await News.countDocuments({ status: 'published' });
        const draftNews = await News.countDocuments({ status: 'draft' });

        // ADMIN STATISTICS (ADMIN ONLY)
        let adminStats = {};
        if (currentAdmin.role === 'admin') {
            const totalAdmins = await Admin.countDocuments({ role: 'admin' });
            const totalRTCs = await Admin.countDocuments({ role: 'rtc' });
            const activeAdmins = await Admin.countDocuments({ status: 'active' });

            // CONTACT STATISTICS
            const totalContacts = await Contact.countDocuments();
            const newContacts = await Contact.countDocuments({ status: 'new' });
            const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });

            adminStats = {
                admins: {
                    total: totalAdmins,
                    rtcs: totalRTCs,
                    active: activeAdmins
                },
                contacts: {
                    total: totalContacts,
                    new: newContacts,
                    resolved: resolvedContacts
                }
            };
        }

        // RTC SPECIFIC STATISTICS
        let rtcStats = {};
        if (currentAdmin.role === 'rtc') {
            const myPanchayats = await GramPanchayat.countDocuments({ 
                createdBy: currentAdmin._id 
            });
            const myMedia = await Media.countDocuments({ 
                uploadedBy: currentAdmin._id 
            });
            const myApprovedMedia = await Media.countDocuments({ 
                uploadedBy: currentAdmin._id,
                status: 'approved'
            });

            rtcStats = {
                myPanchayats,
                myMedia,
                myApprovedMedia,
                assignedDistricts: currentAdmin.assignedDistricts.length
            };
        }

        // RECENT ACTIVITY
        const recentPanchayats = await GramPanchayat.find()
            .select('name slug district createdAt')
            .populate('district', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentMedia = await Media.find({ status: 'approved' })
            .select('title fileType createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        return NextResponse.json(
            { 
                success: true,
                overview: {
                    districts: {
                        total: totalDistricts
                    },
                    panchayats: {
                        total: totalPanchayats,
                        verified: verifiedPanchayats,
                        pending: pendingPanchayats
                    },
                    media: {
                        total: totalMedia,
                        approved: approvedMedia,
                        pending: pendingMedia,
                        images: totalImages,
                        videos: totalVideos
                    },
                    news: {
                        total: totalNews,
                        published: publishedNews,
                        draft: draftNews
                    },
                    ...adminStats,
                    ...rtcStats
                },
                recentActivity: {
                    panchayats: recentPanchayats,
                    media: recentMedia
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Stats Error:", error);
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