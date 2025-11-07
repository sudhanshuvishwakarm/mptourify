import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    featuredImage: {
        type: String,
        required: true
    },
    // Media coverage, press releases, announcements
    category: {
        type: String,
        enum: ['media_coverage', 'press_release', 'announcement', 'update'],
        required: true
    },
    tags: [{
        type: String
    }],
    relatedDistrict: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "districts"
    },
    relatedPanchayat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gramPanchayats"
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'draft'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true
    }
}, {
    timestamps: true
});

const News = mongoose.models.news || mongoose.model("news", newsSchema);
export default News;
