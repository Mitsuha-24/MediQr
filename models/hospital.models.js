import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const hospitalSchema = new mongoose.Schema({
    hospitalName: {
        type: String,
        required: true,
        trim: true,
        unique: true, // Hospital names should be unique
        minlength: [5, 'Hospital name must be at least 5 characters']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [13, 'email must be at least 13 characters']
       // match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters']
    },
    address: {
        streetAddress: {
            type: String,
            required: true,
            trim: true
        },
        cityStateZip: {
            type: String,
            required: true,
            trim: true
        }
    },
    hospitalLicense: {
        // This will store the file path or URL to the uploaded document
        type: String,
       // required: true
    },
    doctorVerification: {
        // This can store the selected verification method (e.g., 'email', 'upload')
        type: String,
        enum: ['email', 'upload'],
       // required: true
    },
    isVerified: {
        // A flag to check if the hospital's documents have been manually verified by an admin
        type: Boolean,
        default: false
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Mongoose middleware to hash the password before saving
hospitalSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;