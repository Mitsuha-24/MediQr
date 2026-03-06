import express from 'express';
import { body, validationResult } from 'express-validator';
import Hospital from '../models/hospital.models.js'; // Ensure this path is correct
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Needed for creating the JWT
import { isHospitalLoggedIn } from '../middleware/auth.middleware.js';

// --- ES MODULE FIX: Define __dirname ---
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ----------------------------------------

const uploadDir = path.join(__dirname, '..', 'uploads', 'licenses');

// 1. Check if the directory exists, and create it if it doesn't
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const hospitalrouter = express.Router();

// 2. Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, basename + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });

// ----------------------------------------------------
// GET Route for Hospital Registration Page 
// ----------------------------------------------------
hospitalrouter.get('/register', (req, res) => {
    res.render('hospitalregistration');
});


// ----------------------------------------------------
// POST Route for Hospital Registration
// ----------------------------------------------------
hospitalrouter.post('/register',
    upload.single('hospitalLicense'), 

    // Validation chain 
    body('hospitalName').trim().isLength({ min: 5 }).withMessage('Hospital name must be at least 5 characters.'),
    body('email').isEmail().withMessage('Must be a valid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('streetAddress').isLength({ min: 5 }).withMessage('Street address must be at least 5 characters.'),
    body('cityStateZip').isLength({ min: 5 }).withMessage('City, State, ZIP must be at least 5 characters.'),
    body('doctorVerification').isIn(['email', 'upload']).withMessage('Invalid doctor verification method selected.'),

    async (req, res) => {
        const errors = validationResult(req);
        
        // --- Handle Validation Errors (and delete uploaded file) ---
        if (!errors.isEmpty()) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                errors: errors.array(),
                message: "Invalid data submitted."
            });
        }
        
        // --- Handle Logic and Database Save ---
        try {
            const { hospitalName, email, password, streetAddress, cityStateZip, doctorVerification } = req.body;
            
            // 1. Check for missing file ONLY IF verification is 'upload'
            if (doctorVerification === 'upload' && !req.file) {
                 return res.status(400).json({ message: "Hospital License file is required for the 'Upload License' method." });
            }
            
            // 2. Hash the password
           // const hashpassword = await bcrypt.hash(password, 10);
            
            // 3. Prepare license path
            let hospitalLicensePath = null;
            if (req.file) {
                hospitalLicensePath = req.file.path; 
            }

            // 4. Create the new hospital record
            const newHospital = await Hospital.create({
                hospitalName,
                email,
                password: password,
                address: { // Mongoose nested object mapping
                    streetAddress,
                    cityStateZip,
                },
                doctorVerification,
                hospitalLicense: hospitalLicensePath
            });

            // 5. Success Response
            res.status(201).json({
                message: "Hospital registered successfully!",
                hospitalId: newHospital._id
            });

        } catch (error) {
            // --- Handle Database/Server Errors (and delete uploaded file) ---
            console.error("Database Save Error:", error); 
            
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }

            if (error.code === 11000) {
                 res.status(409).json({ message: "Registration failed: Email or Hospital Name already exists." });
            } else {
                 res.status(500).json({
                    message: "A server error occurred during registration. Please check server console.",
                    error: error.message
                });
            }
        }
    }
);

hospitalrouter.get('/login', (req , res) =>{
    res.render('login');
});

hospitalrouter.post('/login',
    body('email').trim().isEmail(),
    body('password').trim().isLength({ min: 5 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // 1. Find the hospital
            const hospital = await Hospital.findOne({ email: email });

            if (!hospital) {
                console.log(`❌ Login failed: No hospital found with email ${email}`);
                return res.status(400).json({ message: 'Email not found' });
            }

            // 2. Compare Passwords
            // This is where it's failing for you. 
            const isMatch = await bcrypt.compare(password, hospital.password);
            
            console.log("Password provided:", password);
            console.log("Hashed password in DB:", hospital.password);
            console.log("Match Result:", isMatch);

            if (!isMatch) {
                return res.status(400).json({ message: 'Password is incorrect' });
            }

            // 3. Create Token
            const token = jwt.sign({
                userId: hospital._id,
                email: hospital.email,
                hospitalName: hospital.hospitalName // Note: Hospital model uses hospitalName, not username
            }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // 4. SET THE COOKIE (Important for redirecting)
            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000 // 1 hour 
            });

            // 5. SEND THE RESPONSE (Essential!)
            return res.redirect('/dashboard');

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

hospitalrouter.get('/dashboard', isHospitalLoggedIn, (req, res) => {
    // req.hospital contains the info we saved in the JWT (ID, Email, Name)
    res.render('/dashboard', { 
        hospital: req.hospital 
    });
});

// --- Logout Route ---
hospitalrouter.get('/logout', (req, res) => {
    // Clear the cookie named 'token'
    res.clearCookie('token');
    
    // Redirect to login page with a success message (optional)
    res.redirect('/hospital/login');
});

export default hospitalrouter;