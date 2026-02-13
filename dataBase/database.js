import { Student  } from "../models/studentModel.js";
import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

/* ---------------- OTP Generator ---------------- */
const generateOtp = () => Math.floor(1000 + Math.random() * 9000);

/* ---------------- Mail Transporter ---------------- */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ---------------- Send OTP ---------------- */
const sendOtp = async ({ otp, name, email }) => {
  try {
    

    await transporter.sendMail({
      from: `"Registration Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Hello ${name}, your OTP is ${otp}. It is valid for 5 minutes.`,
      html: `
        <h2>Hello ${name} 👋</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This OTP is valid for <b>5 minutes</b>.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    return otp; // store/hash this in DB
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};


const resendOtp = async ({ name, email , otp}) => {
  try {
    // Invalidate old OTP in DB before calling this (recommended)
    const resendMail = await sendOtp({ name, email, otp });

    return resendMail;
  } catch (error) {
    console.error("Error resending OTP:", error);
    throw error;
  }
};

const resisterStudent = asyncHandler(async (req, res) => {
    try {
        const { name,
            studentNo,
            email,
            gender,
            branch,
            phoneNo,
            unstopId,
            residence,
            rollNumber
        } = req.body;
        const userIp = req.headers["x-forwarded-for"] || req.ip;

  const registrationCount = await Student.countDocuments({ ip: userIp });
  if (registrationCount >= 2) {
    throw new ApiError(400, "Registration limit reached for this device.");
  }
        const exixtingStudent = await Student.findOne({ 
            $or:[
            {studentNo},
            {email}
            ]
        });
        if (exixtingStudent) {
            throw new ApiError(400, "Student already exist ");
        }

        if (!name ||
            !studentNo ||
            !email ||
            !gender ||
            !branch ||
            !phoneNo ||
            !unstopId ||
            !rollNumber||
            !residence) {
            throw new ApiError(400, "all feilds are required");
        }

        const otp = generateOtp();
    
        

        const otpExpiry = Date.now() + 5 * 60 * 1000;

        req.session.otp = otp;
        req.session.otpExpiry = otpExpiry;
        req.session.userData = {
            name,
            studentNo,
            email,
            gender,
            branch,
            phoneNo,
            residence,
            ip: userIp,
            otpExpiry,
            rollNumber,
        };
        const sendmail = await sendOtp({
                name: name,
                email: email,
                otp:otp
        });
        
        return res
            .status(200)
            .json({
                message: "Successfully send the mail",
                data:sendmail
            });
    } catch (error) {
        console.error(error);
    }
    
})

const verifyStudentRegistration = async (req, res) => {
  const { otp } = req.body;

  // Validate OTP
  if (!req.session.otp) {
    throw new ApiError(
      400,
      "OTP not found in session. Please restart registration.",
    );
  }

  if (String(otp) !== String(req.session.otp)) {
    throw new ApiError(401, "Invalid OTP");
  }

  if (req.session.otpExpiry < Date.now()) {
    req.session.otp = null;
    req.session.otpExpiry = null;
    req.session.userData = null;
    throw new ApiError(400, "OTP expired. Please restart registration.");
  }

  const newStudent = await Student.create(req.session.userData);

  if (!newStudent) {
    throw new ApiError(500, "Failed to create student. Please try again.");
  }

  // Clear session after successful registration
  req.session.otp = null;
  req.session.otpExpiry = null;
  req.session.userData = null;

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { student: newStudent },
        "Student registered and verified successfully.",
      ),
    );
};