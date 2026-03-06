import jwt from 'jsonwebtoken';

export const isHospitalLoggedIn = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            // No token found, redirect to login
            return res.redirect('/hospital/login');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the hospital data to the request object
        req.hospital = decoded;
        
        next(); // Permission granted, move to the next function
    } catch (err) {
        console.log("JWT Verification Error:", err.message);
        res.clearCookie('token');
        return res.redirect('/hospital/login');
    }
};