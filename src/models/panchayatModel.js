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
    headerImage: {
        type: String,
        required: true
    },
    district: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "districts",
        required: true
    },
    block: {
        type: String,
        required: true,
        trim: true
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
    
    // Basic Information
    basicInfo: {
        establishmentYear: {
            type: Number
        },
        population: {
            type: Number
        },
        area: {
            type: Number // in sq km
        },
        majorRivers: [{
            type: String,
            trim: true
        }],
        languagesSpoken: [{
            type: String,
            trim: true
        }]
    },

    // Cultural information
    culturalInfo: {
        historicalBackground: {
            type: String,
            trim: true
        },
        traditions: {
            type: String,
            trim: true
        },
        localCuisine: {
            type: String,
            trim: true
        },
        localArt: {
            type: String,
            trim: true
        }
    },
    
    // Political overview
    politicalOverview: [{
        heading: {
            type: String
        },
        description: {
            type: String
        }
    }],

    // Transportation Services
    transportationServices: [{
        name: {
            type: String,
            trim: true
        },
        type: {
            type: String
        },
        location: {
            type: String
        }
    }],

    // Hospitality Services
    hospitalityServices: [{
        name: {
            type: String,
            trim: true
        },
        type: {
            type: String
        },
        location: {
            type: String
        },
        contact: {
            phone: String
        }
    }],
    
    // Emergency Directory
    emergencyDirectory: [{
        service: {
            type: String
        },
        contactNumber: {
            type: String
        }
    }],
    
    // Special Persons
    specialPersons: [{
        name: {
            type: String,
            trim: true
        },
        achievement: {
            type: String
        },
        description: {
            type: String
        }
    }],
    
    mediaGallery: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "media"
    }],
    
    rtcReport: {
        coordinator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admins"
        },
        reportDate: Date,
        summary: String,
        fieldVisitPhotos: [String]
    },
    
    status: {
        type: String,
        enum: ['Verified', 'Pending', 'Draft'],
        default: 'Pending'
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




// import mongoose from "mongoose";

// const gramPanchayatSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     slug: {
//         type: String,
//         required: true,
//         lowercase: true
//     },
//     headerImage: {
//         type: String,
//         required: true
//     },
//     district: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "districts",
//         required: true
//     },
//     block: {
//         type: String,
//         required: true
//     },
//     coordinates: {
//         lat: {
//             type: Number,
//             required: true
//         },
//         lng: {
//             type: Number,
//             required: true
//         }
//     },
//     establishmentYear: {
//         type: Number
//     },
//     historicalBackground: {
//         type: String
//     },
//     population: {
//         type: Number
//     },
//     area: {
//         type: Number // in sq km
//     },
//     localArt: {
//         type: String
//     },
//     localCuisine: {
//         type: String
//     },
//     traditions: {
//         type: String
//     },
//     // Geography
//     majorRivers: [{
//         type: String
//     }],
//     mediaGallery: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "media"
//     }],
//     rtcReport: {
//         coordinator: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "admins"
//         },
//         reportDate: Date,
//         summary: String,
//         fieldVisitPhotos: [String]
//     },
//     status: {
//         type: String,
//         enum: ['verified', 'pending', 'draft'],
//         default: 'pending'
//     },
//     createdBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "admins",
//         required: true
//     }
// }, {
//     timestamps: true
// });

// const GramPanchayat = mongoose.models.gramPanchayats || mongoose.model("gramPanchayats", gramPanchayatSchema);
// export default GramPanchayat;




// new model for whose u have to make all file updation 