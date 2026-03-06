import express from 'express';
import { body, validationResult } from 'express-validator';
import userModel from '../models/user.models.js'; 
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const router = express.Router();

// --- Helper: Aadhaar Structural Validator ---
const validateAadhaarLocal = (number) => {
    const regex = /^[2-9]{1}[0-9]{11}$/; 
    return regex.test(number);
};

// --- Setup Email Transporter ---
// Replace these with your actual Gmail and App Password (or use .env)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anushkasonawane2409@gmail.com' , 
        pass: 'esrq tkws gsio zkug' 
    }
});

// --- GET Routes ---

router.get('/registerpatient', (req, res) => {
    res.render('patientregistration'); 
});

router.get('/login', (req, res) => {
    res.render('login');
});

// --- POST Route: Patient Registration (Sends OTP) ---

router.post('/registerpatient',
    body('username').trim().isLength({ min: 5 }).withMessage('Username must be at least 5 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
    body('adharnumber').trim().custom((value) => {
        if (!validateAadhaarLocal(value)) {
            throw new Error('Invalid Aadhaar: Must be 12 digits and cannot start with 0 or 1');
        }
        return true;
    }),
    
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { adharnumber, email, username, password } = req.body;

        try {
            // 1. Check if user already exists
          /*  const existingUser = await userModel.findOne({ $or: [{ email }, { adharnumber }] });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email or Aadhaar already registered." });
            }*/

            // 2. Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // 3. Hash password and Save User (as unverified)
            const hashpassword = await bcrypt.hash(password, 10);
            const newuser = await userModel.create({
                email,
                username,
                password: hashpassword,
                adharnumber,
                otp: otp,           // Save OTP to DB
                isVerified: false   // User cannot login yet
            });

            // 4. Send the Email
            const mailOptions = {
                from: '"MediQR Security" <' + 'anushkasonawane2409@gmail.com' + '>',
                to: email,
                subject: 'Verify Your MediQR Account',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #4a00e0;">Welcome to MediQR</h2>
                        <p>Thank you for registering. Please use the following code to verify your account:</p>
                        <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px; color: #8e2de2;">${otp}</h1>
                        <p>This code will expire shortly.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ OTP sent to ${email}`);

            res.status(201).json({ 
                success: true, 
                message: "OTP sent to your email!", 
                email: email 
            });

        } catch (error) {
            console.error("🔥 Registration Error:", error);
            res.status(500).json({ success: false, message: "Server error during registration." });
        }
    }
);

// --- NEW POST Route: Verify OTP ---

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // Find user with matching email and OTP
        const user = await userModel.findOne({ email, otp });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }

        // Mark as verified and clear OTP
        user.isVerified = true;
        user.otp = undefined; 
        await user.save();

        res.json({ success: true, message: "Account verified successfully!" });

    } catch (error) {
        console.error("🔥 Verification Error:", error);
        res.status(500).json({ success: false, message: "Verification failed." });
    }
});

// --- POST Route: User Login ---

router.post('/login',
    body('email').trim().isEmail().withMessage('Enter a valid email.'),
    body('password').isLength({ min: 5 }).withMessage('Check your password.'),
    
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { email, password } = req.body;
            
            const user = await userModel.findOne({ email });
            if (!user) {
                return res.status(400).json({ success: false, message: 'Invalid credentials' });
            }

            // Check if user verified their email
            if (!user.isVerified) {
                return res.status(401).json({ success: false, message: 'Please verify your email first.' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Invalid credentials' });
            }

            const token = jwt.sign({
                userId: user._id,
                email: user.email,
                username: user.username
            }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production' 
            });
            
            res.json({ success: true, message: 'Logged in successfully' });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
);

export default router;