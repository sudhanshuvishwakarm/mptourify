// SUBMIT & GET ALL CONTACTS
import { NextResponse } from "next/server";
import { connectDB } from "@/dbConfig/dbConnect.js";
import { getAdmin } from "@/utils/getAdmin.js";
import Contact from "@/models/contactModel.js";

connectDB();

// SUBMIT CONTACT FORM
export async function POST(request) {
    try {
        const contactData = await request.json();
        const { 
            name,
            email,
            phone,
            subject,
            message
        } = contactData;

        // VALIDATE REQUIRED FIELDS
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Please provide required fields: name, email, subject, message" 
                },
                { status: 400 }
            );
        }

        // VALIDATE EMAIL FORMAT
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Invalid email format" 
                },
                { status: 400 }
            );
        }

        // VALIDATE MESSAGE LENGTH
        if (message.length < 10) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Message must be at least 10 characters long" 
                },
                { status: 400 }
            );
        }

        if (message.length > 1000) {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Message must not exceed 1000 characters" 
                },
                { status: 400 }
            );
        }

        // CREATE CONTACT
        const contact = await Contact.create({
            name,
            email: email.toLowerCase(),
            phone: phone || '',
            subject,
            message,
            status: 'new'
        });

        return NextResponse.json(
            { 
                success: true,
                message: "Your message has been sent successfully. We'll get back to you soon!",
                contact: {
                    id: contact._id,
                    name: contact.name,
                    email: contact.email,
                    subject: contact.subject,
                    createdAt: contact.createdAt
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Submit Contact Error:", error);
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

// GET ALL CONTACTS (ADMIN ONLY)
export async function GET(request) {
    try {
        // CHECK IF CURRENT USER IS ADMIN
        const currentAdmin = await getAdmin();

        if (!currentAdmin || currentAdmin.role !== 'admin') {
            return NextResponse.json(
                { 
                    success: false,
                    message: "Unauthorized. Only admins can view contact messages." 
                },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        
        // QUERY PARAMETERS
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'createdAt';
        const order = searchParams.get('order') || 'desc';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;

        // BUILD QUERY
        let query = {};
        
        if (status && ['new', 'resolved'].includes(status)) {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        // BUILD SORT
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sort]: sortOrder };

        // CALCULATE PAGINATION
        const skip = (page - 1) * limit;

        // FETCH CONTACTS
        const contacts = await Contact.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        // GET TOTAL COUNT
        const totalContacts = await Contact.countDocuments(query);
        const totalPages = Math.ceil(totalContacts / limit);

        // GET STATISTICS
        const newCount = await Contact.countDocuments({ status: 'new' });
        const resolvedCount = await Contact.countDocuments({ status: 'resolved' });

        return NextResponse.json(
            { 
                success: true,
                count: contacts.length,
                totalContacts,
                currentPage: page,
                totalPages,
                stats: {
                    new: newCount,
                    resolved: resolvedCount
                },
                contacts
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Get All Contacts Error:", error);
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