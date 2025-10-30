import jwt from "jsonwebtoken";
import Admin from "@/models/adminModel";
import { cookies } from "next/headers";

export async function getAdmin() {
    try {
        const cookieStore = await cookies(); // AWAIT HERE
        const token = cookieStore.get('adminToken')?.value;

        if (!token) {
            return null;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find admin by ID
        const admin = await Admin.findById(decoded.adminId).select('-password');

        if (!admin) {
            return null;
        }

        // Check if admin is active
        if (admin.status !== 'active') {
            return null;
        }

        return admin;
    } catch (error) {
        console.error("getAdmin Error:", error.message);
        return null;
    }
}

export async function isAdmin() {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return { isAdmin: false, admin: null };
        }

        if (admin.role !== 'admin') {
            return { isAdmin: false, admin: admin };
        }

        return { isAdmin: true, admin: admin };
    } catch (error) {
        console.error("isAdmin Error:", error.message);
        return { isAdmin: false, admin: null };
    }
}

export async function checkRole(roles = []) {
    try {
        const admin = await getAdmin();

        if (!admin) {
            return { hasAccess: false, admin: null };
        }

        if (!roles.includes(admin.role)) {
            return { hasAccess: false, admin: admin };
        }

        return { hasAccess: true, admin: admin };
    } catch (error) {
        console.error("checkRole Error:", error.message);
        return { hasAccess: false, admin: null };
    }
}