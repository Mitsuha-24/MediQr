import express from 'express';
import path from 'path';
import router from './routs/user.routs.js';
import hospitalrouter from './routs/hospital.routs.js'; // <-- ADD THIS IMPORT
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectToDB from './config/db.js';
import { isHospitalLoggedIn } from './middleware/auth.middleware.js'; 

dotenv.config();
connectToDB();
const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views');

// --- ROUTE CONFIGURATION ---
app.use('/user', router);
app.use('/hospital', hospitalrouter); // <-- ADD THIS ROUTE

// --- BASE ROUTES ---
// GET / (Renders the initial login page)
app.get('/', (req, res) => {
  res.render('home');
});

// GET /register (Renders the patient register page)
app.get('/register' , (req,res) =>{
    res.render('register');
});

app.get('/about' ,(req , res) =>{
    res.render('about');
});

app.get('/contact' ,(req , res) =>{
    res.render('contact');
});

app.get('/registerpatient' , (req,res)=>{
    res.render('patientregistration');
});

app.get('/hospital/register' , (req,res)=>{
    res.render('hospitalregistration');
});

app.get('/hospital/dashboard', isHospitalLoggedIn, (req, res) => {
    res.render('dashboard');
});

app.get('/login' , (req,res) => {
   // res.redirect(307, '/hospital/login');
    res.render('login');
});


app.listen(3000 , () => {
    console.log ('server is running on port 3000');
});