# MediQR 🏥📲
**Seconds Save Lives.**

MediQR is an emergency medical information system designed to provide first responders and doctors with instant access to a patient's critical medical history via a simple QR code scan. 

---

## 🏗️ Project Status: Under Construction (Active MVP)
MediQR is currently in a high-intensity development phase. While core authentication and QR engines are live, we are actively building the biometric integration and multi-role dashboards.

## 🚀 The Problem: The "Golden Hour"
In medical emergencies, the first 60 minutes are critical. If a patient is unconscious, medical professionals waste precious time searching for:
* **Identity & Emergency Contacts**
* **Chronic Conditions** (Diabetes, Heart Disease, etc.)
* **Severe Allergies** (Penicillin, Latex, etc.)
* **Current Medications**

## ✨ The Solution
MediQR bridges the communication gap. By scanning a unique patient-specific QR code, responders get immediate access to a cloud-stored medical profile, enabling faster, safer, and data-driven treatment.

## 🛠️ Key Features (Current & Incoming)
* ✅ **QR Generation Engine:** Completed unique QR generation for every registered patient.
* ✅ **Nodemailer Verification:** Secure onboarding using SMTP email verification for patient authenticity.
* ✅ **Medical Document Handling:** Support for uploading medical licenses/reports via **Multer**.
* 🚧 **Biometric Roadmap:** Future integration for Iris and Fingerprint scanning to retrieve data without physical QR codes.
* 🚧 **Dual Dashboards:** Specialized UIs for Patients and Emergency Respondents (Paramedics/Doctors).

## 💻 Tech Stack
* **Backend:** Node.js, Express.js
* **Email Service:** Nodemailer (Verification logic)
* **Database:** MongoDB (via Mongoose ODM)
* **Frontend:** EJS (Embedded JavaScript), CSS3, Vanilla JS
* **Security:** Dotenv (Environment Variables), Custom Middleware for Route Protection



## 📂 Project Structure
* `app.js` - Main entry point and server configuration.
* `/models` - Mongoose schemas for User (with verification status) and Medical Profiles.
* `/routs` - Modular routing for `hospital` and `user` management.
* `/middleware` - Security layers for role-based access control.
* `/views` - EJS templates for Login, Register, Dashboards, and verification alerts.
* `/uploads` - Secure directory for medical document storage.

## 🛡️ Feature Roadmap
- [x] **Phase 1:** Core Authentication & QR Engine.
- [x] **Phase 2:** Nodemailer integration for verified onboarding.
- [ ] **Phase 3:** Hospital & Doctor verification (Blue-tick system).
- [ ] **Phase 4:** Emergency Respondent UI (High-speed mobile view).
- [ ] **Phase 5:** Biometric scanning (Fingerprint/Iris recognition research).

## 🔧 Installation & Setup
### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MongoDB](https://www.mongodb.com/) (Running locally or via Atlas connection string)
* [Git](https://git-scm.com/)

### 2. Clone and Install
```bash
# Clone the repository
git clone [https://github.com/Mitsuha-24/MediQr.git](https://github.com/Mitsuha-24/MediQr.git)

# Navigate to the project directory
cd MediQr

# Install project dependencies
npm install
```
### 3.Environment Configuration
Create a .env file in the root directory and add the following required configurations:
* PORT=3000
* MONGO_URI=your_mongodb_connection_string_here
* EMAIL_USER=your_email@example.com
* EMAIL_PASS=your_email_app_password

### 4. Running the Application
Start the development server using:
* node app.js
* The application will be accessible at http://localhost:3000