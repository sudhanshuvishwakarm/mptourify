// UPDATE CONTACT STATUS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import Contact from "@/models/contactModel.js";
import mongoose from "mongoose";

connectDB();

export async function PUT(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can update contact status." 
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
                    message: "Invalid contact ID" 
                },
                { status: 400 }
            );
        }

        const { status } = await request.json();

        // VALIDATE STATUS
        if (!status || !['new', 'resolved'].includes(status)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid status. Must be 'new' or 'resolved'" 
                },
                { status: 400 }
            );
        }

        // CHECK IF CONTACT EXISTS
        const contact = await Contact.findById(id);
        if (!contact) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Contact message not found" 
                },
                { status: 404 }
            );
        }

        // UPDATE STATUS
        contact.status = status;
        
        // If resolving, record who resolved it and when
        if (status === 'resolved' && !contact.respondedBy) {
            contact.respondedBy = currentAdmin._id;
            contact.respondedAt = new Date();
        }
        
        await contact.save();

        return NextResponse.json(
            { 
                success: true,
                message: `Contact status updated to '${status}' successfully`,
                contact: {
                    id: contact._id,
                    name: contact.name,
                    email: contact.email,
                    subject: contact.subject,
                    status: contact.status,
                    respondedAt: contact.respondedAt
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Contact Status Error:", error);
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