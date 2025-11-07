// ADD/UPDATE RTC REPORT FOR A PANCHAYAT
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import mongoose from "mongoose";
import GramPanchayat from "@/models/panchayatModel.js";

connectDB();

export async function PUT(request, context) {
    try {
        // CHECK IF CURRENT USER IS RTC
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'rtc') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only RTCs can add/update reports." 
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

    // CHECK IF RTC HAS ACCESS TO THIS PANCHAYAT'S DISTRICT
    const hasDistrictAccess = currentAdmin.assignedDistricts.some(
        d => d.toString() === panchayat.district.toString()
    );

    if (!hasDistrictAccess) {
        return NextResponse.json(
            { 
                success: false,
                message: "You don't have access to add reports for this district" 
            },
            { status: 403 }
        );
    }

    const { summary, fieldVisitPhotos } = await request.json();

    // VALIDATE REQUIRED FIELDS
    if (!summary) {
        return NextResponse.json(
            { 
                success: false,
                message: "Report summary is required" 
            },
            { status: 400 }
        );
    }

    // UPDATE RTC REPORT
    panchayat.rtcReport = {
        coordinator: currentAdmin._id,
        reportDate: new Date(),
        summary,
        fieldVisitPhotos: fieldVisitPhotos || []
    };

    await panchayat.save();

    // POPULATE RELATIONS
    await panchayat.populate('district', 'name slug');
    await panchayat.populate('rtcReport.coordinator', 'name email employeeId designation');

    return NextResponse.json(
        { 
            success: true,
            message: "RTC report added/updated successfully",
            panchayat: {
                id: panchayat._id,
                name: panchayat.name,
                slug: panchayat.slug,
                district: panchayat.district,
                rtcReport: panchayat.rtcReport
            }
        },
        { status: 200 }
    );

} catch (error) {
    console.error("Add RTC Report Error:", error);
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