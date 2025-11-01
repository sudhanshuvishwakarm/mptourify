// GET & DELETE CONTACT BY ID
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import Contact from "@/models/contactModel.js";
import mongoose from "mongoose";

connectDB();

// GET CONTACT BY ID
export async function GET(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can view contact details." 
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

        // FIND CONTACT
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

        return NextResponse.json(
            { 
                success: true,
                contact
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get Contact Error:", error);
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

// DELETE CONTACT BY ID
export async function DELETE(request, context) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can delete contact messages." 
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

        // DELETE CONTACT (No cascade needed)
        await Contact.findByIdAndDelete(id);

        return NextResponse.json(
            { 
                success: true,
                message: "Contact message deleted successfully",
                deletedContact: {
                    id: contact._id,
                    name: contact.name,
                    subject: contact.subject
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Delete Contact Error:", error);
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