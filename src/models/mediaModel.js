import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String
    },
    fileUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    fileType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    // Categorized by Districts & Panchayats
    category: {
        type: String,
        enum: ['heritage', 'natural', 'cultural', 'event', 'festival'],
        required: true
    },
    tags: [{
        type: String
    }],
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "districts"
    },
    gramPanchayat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gramPanchayats"
    },
    photographer: {
        type: String
    },
    captureDate: {
        type: Date
    },
    // Only admin can upload verified media
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        default: 'pending'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true
    }
}, {
    timestamps: true
});

const Media = mongoose.models.media || mongoose.model("media", mediaSchema);
export default Media;
// import mongoose from "mongoose";

// const mediaSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     description: {
//         type: String
//     },
//     fileUrl: {
//         type: String,
//         required: true
//     },
//     thumbnailUrl: {
//         type: String
//     },
//     fileType: {
//         type: String,
//         enum: ['image', 'video'],
//         required: true
//     },
//     category: {
//         type: String,
//         enum: ['heritage', 'natural', 'cultural', 'event', 'festival'],
//         required: true
//     },
//     tags: [{
//         type: String
//     }],
//     district: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "districts"
//     },
//     gramPanchayat: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "gramPanchayats"
//     },
//     photographer: {
//         type: String
//     },
//     captureDate: {
//         type: Date
//     },
//     status: {
//         type: String,
//         enum: ['approved', 'pending', 'rejected'],
//         default: 'pending'
//     },
//     featured: {
//         type: Boolean,
//         default: false
//     },
//     uploadedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "admins",
//         required: true
//     }
// }, {
//     timestamps: true
// });

// const Media = mongoose.models.media || mongoose.model("media", mediaSchema);
// export default Media;