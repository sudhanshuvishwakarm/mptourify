import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    headerImage: {
        type: String,
        required: true
    },
    formationYear: {
        type: Number
    },
    area: {
        type: Number // in sq km
    },
    population: {
        type: Number
    },
    // Geography
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
    majorRivers: [{
        type: String
    }],
    hills: [{
        type: String
    }],
    naturalSpots: [{
        type: String
    }],
    // History & Culture
    historyAndCulture: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'draft'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true
    }
}, {
    timestamps: true
});
// Administrative Info
// administrativeDivisions: [{
//     type: String
// }],
// politicalConstituencies: {
//     lokSabha: [String],
//     vidhanSabha: [String]
// },

const District = mongoose.models.districts || mongoose.model("districts", districtSchema);
export default District;

// Tourist Places & Heritage Sites
// touristPlaces: [{
//     name: String,
//     description: String,
//     images: [String],
//     category: {
//         type: String,
//         enum: ['monument', 'natural', 'religious', 'cultural']
//     }
// }],
// Famous Personalities
// famousPersonalities: [{
//     name: String,
//     field: String,
//     description: String,
//     image: String
// }],