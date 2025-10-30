import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'resolved'],
        default: 'new'
    }
}, {
    timestamps: true
});

const Contact = mongoose.models.contacts || mongoose.model("contacts", contactSchema);
export default Contact;
// import mongoose from "mongoose";

// const contactSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     email: {
//         type: String,
//         required: true,
//         lowercase: true,
//         trim: true
//     },
//     phone: {
//         type: String
//     },
//     subject: {
//         type: String,
//         required: true
//     },
//     message: {
//         type: String,
//         required: true
//     },
//     type: {
//         type: String,
//         enum: ['feedback', 'complaint', 'suggestion', 'query', 'correction'],
//         default: 'query'
//     },
//     relatedDistrict: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "districts"
//     },
//     relatedPanchayat: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "gramPanchayats"
//     },
//     status: {
//         type: String,
//         enum: ['new', 'in_progress', 'resolved', 'closed'],
//         default: 'new'
//     },
//     response: {
//         type: String
//     },
//     respondedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "admins"
//     },
//     respondedAt: {
//         type: Date
//     }
// }, {
//     timestamps: true
// });

// const Contact = mongoose.models.contacts || mongoose.model("contacts", contactSchema);
// export default Contact;