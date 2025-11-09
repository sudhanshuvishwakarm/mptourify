import mongoose from "mongoose";

const gramPanchayatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        lowercase: true
    },
    // Location Info
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "districts",
        required: true
    },
    block: {
        type: String,
        required: true
    },
    coordinates: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    // Establishment & Historical Background
    establishmentYear: {
        type: Number
    },
    historicalBackground: {
        type: String
    },
    population: {
        type: Number
    },
    localArt: {
        type: String
    },
    localCuisine: {
        type: String 
    },
    traditions: {
        type: String
    },
    // Photo Gallery (5–10 images)
    photoGallery: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "media"
    }],
    // Optional Video Section
    videoGallery: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "media"
    }],
    // Report by RTC
    rtcReport: {
        coordinator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admins" // RTC who submitted report
        },
        reportDate: Date,
        summary: String,
        fieldVisitPhotos: [String]
    },
    status: {
        type: String,
        enum: ['verified', 'pending', 'draft'],
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true
    }
}, {
    timestamps: true
});

const GramPanchayat = mongoose.models.gramPanchayats || mongoose.model("gramPanchayats", gramPanchayatSchema);
export default GramPanchayat;
