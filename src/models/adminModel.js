import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'rtc'],
        required: true,
        default: 'admin'
    },
    // Only for RTC role
    assignedDistricts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "districts"
    }],
    employeeId: {
        type: String
    },
    designation: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

const Admin = mongoose.models.admins || mongoose.model("admins", adminSchema);
export default Admin;

