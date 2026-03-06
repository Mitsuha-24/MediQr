import jwt from 'jsonwebtoken';

export const isHospitalLoggedIn = (req, res, next) => {
    const token = req.cookies.token;
    
    // DEBUG: See what is happening in the terminal
    console.log("DEBUG: Checking Token...", token);

    if (!token) {
        console.log("DEBUG: No token found. Redirecting to login.");
        return res.redirect('/hospital/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.hospital = decoded;
        next(); 
    } catch (err) {
        console.log("DEBUG: Token verification failed:", err.message);
        res.clearCookie('token');
        return res.redirect('/hospital/login');
    }
};